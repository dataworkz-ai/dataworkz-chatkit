import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ThumbsUpIcon,
  ThumbsDownIcon,
  ThumbsUpFilledIcon,
  ThumbsDownFilledIcon,
} from '../../../../icons';
import { Popover } from '../../../../popover/popover';
import { ChatWindowEventsService } from '../../../../../services/chat-window.events';
import { TAdditionalFeedback } from '../../../../../typings/data';

@Component({
  selector: 'dw-ai-message-feedback',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Popover,
    ThumbsUpIcon,
    ThumbsDownIcon,
    ThumbsUpFilledIcon,
    ThumbsDownFilledIcon,
  ],
  templateUrl: './ai-message-feedback.html',
  styleUrl: './ai-message-feedback.scss',
})
export class AiMessageFeedback {
  messageId = input.required<string>();
  type = input.required<'up' | 'down'>();
  thumbsUpOrDown = input<number | undefined>();
  additionalFeedback = input<TAdditionalFeedback | undefined>();

  @ViewChild('feedbackPopover') feedbackPopover!: Popover;

  private readonly elementRef = inject(ElementRef);
  private readonly chatWindowEventsService = inject(ChatWindowEventsService);

  readonly id = computed(() => `${this.messageId()}-${this.type()}`);
  readonly popoverPosition = signal<'top' | 'bottom'>('top');

  constructor() {
    effect(() => {
      const activeId = this.chatWindowEventsService.activeFeedbackId();
      if (activeId && activeId !== this.id()) {
        this.feedbackPopover?.close();
      }
    });
  }

  readonly isActive = computed(() => {
    const current = this.thumbsUpOrDown();
    return (this.type() === 'up' && current === 1) || (this.type() === 'down' && current === -1);
  });

  readonly feedbackText = signal<string | undefined>(undefined);
  readonly thisIsntTrue = signal<boolean | undefined>(undefined);
  readonly thisIsntHelpful = signal<boolean | undefined>(undefined);

  onToggle(popover: Popover) {
    if (!popover.isOpen()) {
      const rect = this.elementRef.nativeElement.getBoundingClientRect();
      const chatWindow =
        this.elementRef.nativeElement.closest('.dw-chat-window-messages') ||
        this.elementRef.nativeElement.closest('dw-chat-window');

      if (chatWindow) {
        const chatRect = chatWindow.getBoundingClientRect();
        const relativeTop = rect.top - chatRect.top;
        this.popoverPosition.set(relativeTop > chatRect.height / 2 ? 'top' : 'bottom');
      } else {
        this.popoverPosition.set(rect.top > window.innerHeight / 2 ? 'top' : 'bottom');
      }
    }

    popover.toggle();

    if (popover.isOpen()) {
      // Popover just opened
      this.chatWindowEventsService.activeFeedbackId.set(this.id());

      // Populate local state from input values (the source of truth)
      const currentFeedback = this.additionalFeedback();
      this.feedbackText.set(currentFeedback?.feedbackText);
      this.thisIsntTrue.set(currentFeedback?.thisIsntTrue);
      this.thisIsntHelpful.set(currentFeedback?.thisIsntHelpful);

      this.sendCurrentState();
    } else {
      // Popover just closed
      if (this.chatWindowEventsService.activeFeedbackId() === this.id()) {
        this.chatWindowEventsService.activeFeedbackId.set(null);
      }
    }
  }

  onFeedbackTextChange(event: Event) {
    this.feedbackText.set((event.target as HTMLTextAreaElement).value);
  }

  onThisIsntTrue(event: Event) {
    this.thisIsntTrue.set((event.target as HTMLInputElement).checked);
  }

  onThisIsntHelpful(event: Event) {
    this.thisIsntHelpful.set((event.target as HTMLInputElement).checked);
  }

  private sendCurrentState = () => {
    this.chatWindowEventsService.feedback$.next({
      messageId: this.messageId(),
      thumbsUpOrDown: this.type() === 'up' ? 1 : -1,
      additionalFeedback: {
        feedbackText: this.feedbackText(),
        ...(this.type() === 'down' && {
          thisIsntTrue: this.thisIsntTrue(),
          thisIsntHelpful: this.thisIsntHelpful(),
        }),
      },
    });
  };

  onSubmitFeedback(popover: Popover) {
    this.sendCurrentState();
    popover.close();
    this.chatWindowEventsService.activeFeedbackId.set(null);
  }
}
