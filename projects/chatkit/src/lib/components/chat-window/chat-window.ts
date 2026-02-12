import {
  Component,
  computed,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
  signal,
  effect,
} from '@angular/core';
import { Footer } from './footer/footer';
import { UserMessage } from './user-message/user-message';
import { AiMessage } from './ai-message/ai-message';
import { ChatWindowDataService } from '../../services/chat-window.data';
import { Skeleton } from '../skeleton/skeleton';
import { ConversationIcon, ChevronIcon, UploadIcon } from '../icons';
import { ChatWindowEventsService } from '../../services/chat-window.events';
import {
  isScrolledUp,
  scrollToBottom,
  getDistanceFromBottom,
  centerMessageInChat,
  centerStepsInChat,
} from './utils';

@Component({
  selector: 'dw-chat-window',
  imports: [Footer, UserMessage, AiMessage, Skeleton, ConversationIcon, ChevronIcon, UploadIcon],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss',
})
export class ChatWindow implements AfterViewInit, OnDestroy {
  private readonly chatWindowDataService = inject(ChatWindowDataService);
  private readonly chatWindowEventsService = inject(ChatWindowEventsService);
  private readonly ngZone = inject(NgZone);

  constructor() {
    effect(() => {
      const request = this.chatkitScroll();
      if (!request) return;
      this.chatWindowEventsService.scrollComplete$.next();

      const chatbody = this.chatBodyRef?.nativeElement;
      if (!chatbody) return;

      switch (request.type) {
        case 'bottom':
          scrollToBottom(chatbody, request.behavior);
          break;
        case 'messageId':
          centerMessageInChat(chatbody, request.messageId, request.behavior);
          break;
        case 'steps':
          centerStepsInChat(chatbody, request.messageId, request.behavior);
          break;
      }
    });
  }

  @ViewChild('chatBody') chatBodyRef!: ElementRef<HTMLDivElement>;

  readonly showScrollDownButton = signal(false);
  readonly isDragging = signal(false);
  private dragCounter = 0;

  private mutationObserver: MutationObserver | undefined = undefined;

  private chatkitScroll = computed(() => {
    return this.chatWindowDataService.chatkitScroll();
  });

  readonly chatkitConversationLoading = computed(() => {
    return this.chatWindowDataService.chatkitConversation()?.loading;
  });

  readonly chatkitConversationError = computed(() => {
    return this.chatWindowDataService.chatkitConversation()?.error;
  });

  readonly chatkitConversation = computed(() => {
    return this.chatWindowDataService.chatkitConversation().value;
  });

  readonly chatkitAgentLoading = computed(() => {
    return this.chatWindowDataService.chatkitAgent().loading;
  });

  readonly chatkitAgentError = computed(() => {
    return this.chatWindowDataService.chatkitAgent().error;
  });

  readonly chatkitAgentDescription = computed(() => {
    return this.chatWindowDataService.chatkitAgent().value.description;
  });

  readonly showFooter = computed(() => {
    return !!this.chatWindowDataService.chatkitFlags()?.footer;
  });

  readonly showAttachmentComputer = computed(() => {
    return !!this.chatWindowDataService.chatkitFlags()?.footer?.attachment?.computer;
  });

  ngAfterViewInit() {
    this.scrollListener();

    this.setupMutationObserver();
    this.ngZone.runOutsideAngular(() => {
      this.chatBodyRef.nativeElement?.addEventListener('scroll', this.scrollListener, {
        passive: true,
      });
    });
  }

  ngOnDestroy() {
    this.chatBodyRef?.nativeElement?.removeEventListener('scroll', this.scrollListener);
    this.mutationObserver?.disconnect();
  }

  onScrollButton() {
    this.chatWindowDataService.setChatkitScroll({ type: 'bottom', behavior: 'smooth' });
  }

  private scrollListener = () => {
    const el = this.chatBodyRef.nativeElement;
    this.showScrollDownButton.set(isScrolledUp(el, 500));
  };

  private setupMutationObserver() {
    const chatBody = this.chatBodyRef.nativeElement;

    if (!chatBody) return;

    this.mutationObserver = new MutationObserver((mutations) => {
      const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);

      if (hasAddedNodes && getDistanceFromBottom(chatBody) < 100) {
        setTimeout(() => {
          this.chatWindowDataService.setChatkitScroll({ type: 'bottom', behavior: 'smooth' });
        }, 100);
      }
    });

    this.ngZone.runOutsideAngular(() => {
      this.mutationObserver!.observe(chatBody, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    });
  }

  onDragOver(event: DragEvent) {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    event.stopPropagation();
  }

  onDragEnter(event: DragEvent) {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter++;
    if (this.dragCounter === 1) {
      this.isDragging.set(true);
    }
  }

  onDragLeave(event: DragEvent) {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.isDragging.set(false);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter = 0;
    this.isDragging.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const filesArray = Array.from(event.dataTransfer.files);
      this.chatWindowEventsService.selectComputerUpload$.next(filesArray);
    }
  }
}
