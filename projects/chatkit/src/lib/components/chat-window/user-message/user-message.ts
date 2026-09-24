import { Component, computed, inject, Input } from '@angular/core';
import { ChatWindowDataService } from '../../../services/chat-window.data';
import { FileItem } from '../../file-item/file-item';
import { ChatWindowEventsService } from '../../../services/chat-window.events';
import { TMessageFile } from '../../../typings/data';
import { formatMessageTimestamp } from '../utils';

@Component({
  selector: 'dw-user-message',
  imports: [FileItem],
  templateUrl: './user-message.html',
  styleUrl: './user-message.scss',
})
export class UserMessage {
  @Input({ required: true }) messageId!: string;

  private readonly chatWindowDataService = inject(ChatWindowDataService);
  private readonly chatWindowEventsService = inject(ChatWindowEventsService);

  readonly parts = computed(() => {
    return this.chatWindowDataService.messagesMap()[this.messageId]?.value?.parts || [];
  });

  readonly timestampLabel = computed(() => {
    if (!this.chatWindowDataService.chatkitFlags()?.message?.timestamps) return '';
    return formatMessageTimestamp(
      this.chatWindowDataService.messagesMap()[this.messageId]?.value?.timestamp,
    );
  });

  onClick(file: TMessageFile) {
    this.chatWindowEventsService.selectFile$.next(file);
  }
}
