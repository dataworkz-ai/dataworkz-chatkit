import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { ChatWindowDataService } from '../../../../services/chat-window.data';
import { CheckIcon, CopyIcon } from '../../../icons';
import { Timestamp } from '../../../timestamp/timestamp';
import { parseMessageTimestamp } from '../../utils';
import { AiMessageFeedback } from './ai-message-feedback/ai-message-feedback';

const COPIED_RESET_DELAY = 1500;

@Component({
  selector: 'dw-ai-message-actions',
  imports: [AiMessageFeedback, Timestamp, CopyIcon, CheckIcon],
  templateUrl: './ai-message-actions.html',
  styleUrl: './ai-message-actions.scss',
})
export class AiMessageActions {
  readonly taskId = input.required<string>();
  readonly messageId = input.required<string>();

  private readonly chatWindowDataService = inject(ChatWindowDataService);

  private readonly message = computed(
    () => this.chatWindowDataService.messagesMap()[this.messageId()],
  );

  private readonly messagePresent = computed(
    () => !this.message()?.loading && !!this.message()?.value?.parts?.length,
  );

  // The markdown response: every text part, in order
  readonly responseText = computed(() => {
    if (!this.messagePresent()) return '';
    return (this.message()?.value?.parts ?? [])
      .map((part) => (part.kind === 'text' ? part.text?.trim() : ''))
      .filter(Boolean)
      .join('\n\n');
  });

  readonly showFeedback = computed(
    () =>
      this.chatWindowDataService.chatkitFlags()?.agentMessage?.feedback !== undefined &&
      this.messagePresent(),
  );

  readonly timestamp = computed(() => {
    if (!this.chatWindowDataService.chatkitFlags()?.message?.timestamps) return null;
    if (!this.messagePresent()) return null;
    return parseMessageTimestamp(this.message()?.value?.timestamp);
  });

  readonly thumbsUpOrDown = computed(() => this.message()?.value?.thumbsUpOrDown);
  readonly additionalFeedback = computed(() => this.message()?.value?.additionalFeedback);

  readonly hasActions = computed(
    () => !!this.responseText() || this.showFeedback() || !!this.timestamp(),
  );

  readonly copied = signal(false);
  private copiedTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copiedTimer));
  }

  async onCopy() {
    const text = this.responseText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    this.copied.set(true);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => this.copied.set(false), COPIED_RESET_DELAY);
  }
}
