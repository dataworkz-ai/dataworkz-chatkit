import { Component, computed, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Steps } from './steps/steps';
import { ListCheckIcon, ArrowRightIcon } from '../../../icons';
import { ChatWindowEventsService } from '../../../../services/chat-window.events';
import { ChatWindowDataService } from '../../../../services/chat-window.data';
import { AiMessageFeedback } from './ai-message-feedback/ai-message-feedback';

@Component({
  selector: 'dw-ai-message-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, Steps, ListCheckIcon, ArrowRightIcon, AiMessageFeedback],
  templateUrl: './ai-message-footer.html',
  styleUrl: './ai-message-footer.scss',
})
export class AiMessageFooter {
  @Input({ required: true }) messageId!: string;

  private readonly chatWindowEventsService = inject(ChatWindowEventsService);
  private readonly chatWindowDataService = inject(ChatWindowDataService);

  readonly messagePresent = computed(() => {
    return !!this.chatWindowDataService.messagesMap()[this.messageId]?.value;
  });

  readonly stepsText = computed(() => {
    if (!this.messagePresent()) {
      return 'Steps';
    }
    if (this.stepsExpanded()) {
      return 'Collapse Steps';
    }
    return 'View Steps';
  });

  readonly stepsExpanded = computed(() => {
    if (!this.messagePresent()) {
      return true;
    }
    return this.chatWindowDataService.stepPlanItemsOpenMap()[this.messageId];
  });

  readonly showSteps = computed(() => {
    return !!this.chatWindowDataService.chatkitFlags()?.agentMessage?.steps;
  });

  readonly showProbe = computed(() => {
    return (
      !!this.chatWindowDataService.chatkitFlags()?.agentMessage?.probe && this.messagePresent()
    );
  });

  readonly showFeedback = computed(() => {
    return (
      this.chatWindowDataService.chatkitFlags()?.agentMessage?.feedback !== undefined &&
      this.messagePresent()
    );
  });

  readonly message = computed(() => {
    return this.chatWindowDataService.messagesMap()[this.messageId]?.value;
  });

  readonly thumbsUpOrDown = computed(() => {
    return this.message()?.thumbsUpOrDown;
  });

  readonly additionalFeedback = computed(() => {
    return this.message()?.additionalFeedback;
  });

  toggleSteps() {
    if (!this.messagePresent()) {
      return;
    }
    this.chatWindowEventsService.viewSteps$.next(this.messageId);
  }

  onViewProbe() {
    this.chatWindowEventsService.viewProbe$.next(this.messageId);
  }
}
