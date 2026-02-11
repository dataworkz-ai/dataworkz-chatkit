import { Component, computed, inject, Input } from '@angular/core';
import { ChatWindowDataService } from '../../../services/chat-window.data';
import { FileItem } from '../../file-item/file-item';
import { ChatWindowEventsService } from '../../../services/chat-window.events';
import { TMessageFile } from '../../../typings/data';
import { ProfileIcon } from '../../icons/profile-icon';

@Component({
  selector: 'dw-user-message',
  imports: [FileItem, ProfileIcon],
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

  readonly userInitials = computed(() => {
    return this.chatWindowDataService.chatkitProps().userInitials;
  });

  onClick(file: TMessageFile) {
    this.chatWindowEventsService.selectFile$.next(file);
  }
}
