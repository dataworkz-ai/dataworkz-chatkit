import {
  afterNextRender,
  effect,
  inject,
  Injectable,
  Injector,
  NgZone,
  signal,
  untracked,
} from '@angular/core';
import { ChatWindowDataService } from '../../services/chat-window.data';
import { centerElementInContainer, getDistanceFromBottom } from './utils';

// within this distance of the bottom counts as "at the bottom"
const PIN_THRESHOLD = 80;
// gap kept above an anchored user message
const ANCHOR_OFFSET = 16;

type TScrollJump = 'onLoad' | 'onSend' | 'steps' | 'toHighlight' | 'scrollDownButton';

const DEFAULT_BEHAVIOR: Record<TScrollJump, ScrollBehavior> = {
  onLoad: 'auto',
  onSend: 'smooth',
  steps: 'smooth',
  toHighlight: 'auto',
  scrollDownButton: 'smooth',
};

// a target the view keeps in place while content around it settles, until the user scrolls
type THold =
  | { kind: 'message'; id: string }
  | { kind: 'element'; el: HTMLElement }
  | { kind: 'anchor'; id: string };

/**
 * Owns every scroll in the chat body: initial positioning, sends, following streamed content,
 * the highlighted message and the steps panel. Only one target is held at a time, and positions
 * are reapplied whenever content resizes, so nothing depends on timers.
 */
@Injectable()
export class ChatScrollService {
  private readonly chatWindowDataService = inject(ChatWindowDataService);
  private readonly ngZone = inject(NgZone);
  private readonly injector = inject(Injector);

  readonly showScrollDownButton = signal(false);

  private body?: HTMLElement;
  private spacer?: HTMLElement;
  private resizeObserver?: ResizeObserver;

  private messageIds: string[] = [];
  // set once the current conversation has been positioned; nothing follows before that
  private positioned = false;
  private pinned = true;
  private lastScrollTop = 0;
  private hold?: THold;
  // a smooth jump to the bottom is still animating: growth re-aims it instead of snapping
  private smoothToBottom = false;
  // a smooth jump to a held target is still animating: corrections stay smooth until it settles
  private smoothHold = false;
  private scrollIdleTimer?: ReturnType<typeof setTimeout>;
  // the user message that the anchor spacer is sized for
  private anchorId?: string;
  private highlightId?: string;
  private pendingFocusId?: string;

  constructor() {
    effect(() => {
      const conversation = this.chatWindowDataService.chatkitConversation();
      const ids = conversation.loading
        ? []
        : (conversation.value || []).flatMap((task) => task.messageIds);
      untracked(() => this.onConversation(ids));
    });

    effect(() => {
      const id = this.chatWindowDataService.chatkitProps().highlightMessageId || undefined;
      untracked(() => this.onHighlight(id));
    });
  }

  attach(body: HTMLElement, spacer: HTMLElement) {
    this.body = body;
    this.spacer = spacer;
    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(body);
      body.addEventListener('scroll', this.onScroll, { passive: true });
      for (const type of ['wheel', 'touchmove', 'mousedown', 'keydown']) {
        body.addEventListener(type, this.onUserIntent, { passive: true });
      }
    });
  }

  detach() {
    clearTimeout(this.scrollIdleTimer);
    this.resizeObserver?.disconnect();
    this.body?.removeEventListener('scroll', this.onScroll);
    for (const type of ['wheel', 'touchmove', 'mousedown', 'keydown']) {
      this.body?.removeEventListener(type, this.onUserIntent);
    }
  }

  // messages register themselves so content growth anywhere in the list is seen
  observe(el: HTMLElement) {
    this.resizeObserver?.observe(el);
  }

  unobserve(el: HTMLElement) {
    this.resizeObserver?.unobserve(el);
  }

  onScrollDownButton() {
    this.scrollToBottom(this.behavior('scrollDownButton'));
  }

  private scrollToBottom(behavior: ScrollBehavior) {
    if (!this.body) return;
    this.hold = undefined;
    this.pinned = true;
    this.smoothToBottom = behavior === 'smooth';
    this.body.scrollTo({ top: this.body.scrollHeight, behavior });
    this.updateButton();
  }

  // brings an element (the steps panel) into view and keeps it there while it loads / grows
  reveal(el: HTMLElement) {
    if (this.flags()?.steps === false || !this.body) return;
    this.hold = { kind: 'element', el };
    this.pinned = false;
    this.smoothToBottom = false;
    this.applyHold(this.behavior('steps'));
  }

  private flags() {
    return this.chatWindowDataService.chatkitFlags()?.scroll;
  }

  // how a jump the user sees animates; always instant when they prefer reduced motion
  private behavior(jump: TScrollJump): ScrollBehavior {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 'auto';
    return this.flags()?.behavior?.[jump] || DEFAULT_BEHAVIOR[jump];
  }

  private afterRender(fn: () => void) {
    afterNextRender(fn, { injector: this.injector });
  }

  private onConversation(ids: string[]) {
    const prev = this.messageIds;
    this.messageIds = ids;

    if (!ids.length) {
      if (prev.length) this.reset();
      return;
    }

    // first render, or a different conversation swapped in
    if (!prev.length || prev[0] !== ids[0]) {
      this.reset();
      this.afterRender(() => this.positionOnLoad());
      return;
    }

    const prevIds = new Set(prev);
    const messagesMap = this.chatWindowDataService.messagesMap();
    const userId = ids
      .filter((id) => !prevIds.has(id))
      .reverse()
      .find((id) => messagesMap[id]?.value?.role === 'USER');
    if (userId) {
      this.afterRender(() => this.positionOnSend(userId));
    }
  }

  private onHighlight(id: string | undefined) {
    if (id === this.highlightId) return;
    this.highlightId = id;
    this.pendingFocusId = id && this.flags()?.toHighlight !== false ? id : undefined;
    // an already positioned conversation focuses right away; otherwise the load does it
    if (this.positioned && this.pendingFocusId) {
      this.afterRender(() => this.focusPending());
    }
  }

  private reset() {
    this.positioned = false;
    this.pinned = true;
    this.hold = undefined;
    this.smoothToBottom = false;
    this.smoothHold = false;
    this.anchorId = undefined;
    this.setSpacer(0);
  }

  private positionOnLoad() {
    if (!this.body) return;
    this.positioned = true;
    if (this.focusPending()) return;

    if (this.flags()?.onLoad === 'none') {
      this.pinned = false;
      this.updateButton();
      return;
    }
    this.scrollToBottom(this.behavior('onLoad'));
  }

  // scrolls to the highlighted message if it belongs to this conversation; returns whether it did
  private focusPending(): boolean {
    const id = this.pendingFocusId;
    if (!id || !this.body) return false;
    this.pendingFocusId = undefined;
    if (!this.messageIds.includes(id)) return false;

    this.hold = { kind: 'message', id };
    this.pinned = false;
    this.smoothToBottom = false;
    this.applyHold(this.behavior('toHighlight'));
    return true;
  }

  private positionOnSend(userId: string) {
    if (!this.body) return;
    const onSend = this.flags()?.onSend || 'bottom';
    if (onSend === 'none') return;

    this.anchorId = undefined;
    this.setSpacer(0);

    if (onSend === 'bottom') {
      this.scrollToBottom(this.behavior('onSend'));
      return;
    }

    this.anchorId = userId;
    this.hold = { kind: 'anchor', id: userId };
    this.pinned = false;
    this.smoothToBottom = false;
    this.updateSpacer();
    this.applyHold(this.behavior('onSend'));
  }

  private messageEl(id: string): HTMLElement | null {
    return this.body?.querySelector(`[id="${CSS.escape(id)}"]`) as HTMLElement | null;
  }

  private applyHold(behavior: ScrollBehavior = 'auto') {
    const body = this.body;
    const hold = this.hold;
    if (!body || !hold) return;
    if (behavior === 'smooth') {
      this.smoothHold = true;
      this.restartScrollIdle();
    }

    if (hold.kind === 'anchor') {
      const el = this.messageEl(hold.id);
      if (!el) return;
      body.scrollTo({ top: this.anchorTop(el) - ANCHOR_OFFSET, behavior });
      return;
    }

    const el = hold.kind === 'element' ? hold.el : this.messageEl(hold.id);
    if (!el?.isConnected) {
      this.hold = undefined;
      return;
    }
    centerElementInContainer(body, el, behavior);
  }

  // the steps panel's corrections are the reveal the user waits for (spinner → plan), so they
  // follow its behavior; the others stay instant to keep the position steady, unless a smooth
  // jump is still animating, which they'd otherwise cut off
  private holdCorrectionBehavior(hold: THold): ScrollBehavior {
    if (hold.kind === 'element') return this.behavior('steps');
    return this.smoothHold ? 'smooth' : 'auto';
  }

  // smooth scrolling fires scroll events every frame; a short quiet spell means it has settled
  private restartScrollIdle() {
    clearTimeout(this.scrollIdleTimer);
    this.scrollIdleTimer = setTimeout(() => (this.smoothHold = false), 150);
  }

  // top of the element in the body's scroll coordinates
  private anchorTop(el: HTMLElement): number {
    const body = this.body!;
    return el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop;
  }

  // sizes the spacer so the anchored message can reach the top; it shrinks as the response grows
  private updateSpacer() {
    const body = this.body;
    if (!body || !this.anchorId) return;
    const el = this.messageEl(this.anchorId);
    if (!el) return;

    const current = this.spacer?.offsetHeight || 0;
    const target = this.anchorTop(el) - ANCHOR_OFFSET;
    const maxWithoutSpacer = body.scrollHeight - current - body.clientHeight;
    this.setSpacer(Math.max(0, target - maxWithoutSpacer));
  }

  private setSpacer(height: number) {
    if (this.spacer) this.spacer.style.height = `${Math.round(height)}px`;
  }

  private updateButton() {
    const body = this.body;
    if (!body) return;
    // while following, the distance is back to zero before paint, so this only shows when not followed
    const show =
      this.flags()?.scrollDownButton !== false && getDistanceFromBottom(body) > PIN_THRESHOLD;
    if (show !== this.showScrollDownButton()) {
      this.ngZone.run(() => this.showScrollDownButton.set(show));
    }
  }

  private onResize = () => {
    const body = this.body;
    if (!body || !this.positioned) return;

    this.updateSpacer();
    if (this.hold) {
      this.applyHold(this.holdCorrectionBehavior(this.hold));
    } else if (this.smoothToBottom) {
      body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });
    } else if (this.pinned && this.flags()?.onResponse !== 'none') {
      body.scrollTop = body.scrollHeight;
    }
    this.updateButton();
  };

  private onScroll = () => {
    const body = this.body;
    if (!body) return;
    const scrollTop = body.scrollTop;
    if (this.smoothHold) this.restartScrollIdle();
    if (this.smoothToBottom && getDistanceFromBottom(body) <= 1) {
      this.smoothToBottom = false;
    }
    if (this.hold) {
      // a held position never pins, or releasing it would jump to the bottom
    } else if (getDistanceFromBottom(body) <= PIN_THRESHOLD) {
      this.pinned = true;
    } else if (scrollTop < this.lastScrollTop) {
      // moving up unpins; content growing below doesn't fire scroll, so it never unpins
      this.pinned = false;
    }
    this.lastScrollTop = scrollTop;
    this.updateButton();
  };

  // the user taking over ends any held position
  private onUserIntent = () => {
    this.hold = undefined;
    this.smoothToBottom = false;
    this.smoothHold = false;
  };
}
