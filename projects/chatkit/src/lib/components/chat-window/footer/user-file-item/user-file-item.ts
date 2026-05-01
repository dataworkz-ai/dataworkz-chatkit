import { Component, computed, inject, input, output } from '@angular/core';
import { ChatWindowDataService } from '../../../../services/chat-window.data';
import { FileItem } from '../../../file-item/file-item';
import { ChatWindowEventsService } from '../../../../services/chat-window.events';

@Component({
  selector: 'dw-user-file-item',
  standalone: true,
  imports: [FileItem],
  templateUrl: './user-file-item.html',
  styleUrl: './user-file-item.scss',
})
export class UserFileItem {
  private readonly chatWindowDataService = inject(ChatWindowDataService);
  private readonly chatWindowEventsService = inject(ChatWindowEventsService);

  filename = input.required<string>();

  private readonly fileStatus = computed(() => {
    return this.chatWindowDataService.chatkitFooter().userFilesMap?.[this.filename()];
  });

  readonly messageFile = computed(() => this.fileStatus()?.messageFile);
  readonly ingestStatus = computed(() => this.fileStatus()?.ingestStatus);
  readonly uploadStatus = computed(() => this.fileStatus()?.uploadStatus);
  readonly documentStatus = computed(() => this.fileStatus()?.documentStatus);

  onRemove() {
    this.chatWindowEventsService.removeUserFile$.next(this.filename());
  }

  onClick() {
    this.chatWindowEventsService.selectFile$.next(this.messageFile());
  }
}
