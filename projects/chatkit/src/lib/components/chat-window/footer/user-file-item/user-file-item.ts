import { Component, computed, input, output } from '@angular/core';
import { FileItem } from '../../../file-item/file-item';
import { TUserFile } from '../../../../typings/config';
import { TMessageFile } from '../../../../typings/data';

@Component({
  selector: 'dw-user-file-item',
  standalone: true,
  imports: [FileItem],
  templateUrl: './user-file-item.html',
  styleUrl: './user-file-item.scss',
})
export class UserFileItem {
  filename = input.required<string>();
  fileStatus = input<TUserFile | undefined>(undefined);

  readonly remove = output<string>();
  readonly fileClick = output<TMessageFile | undefined>();

  readonly messageFile = computed(() => this.fileStatus()?.messageFile);
  readonly ingestStatus = computed(() => this.fileStatus()?.ingestStatus);
  readonly uploadStatus = computed(() => this.fileStatus()?.uploadStatus);
  readonly documentStatus = computed(() => this.fileStatus()?.documentStatus);

  onRemove() {
    this.remove.emit(this.filename());
  }

  onClick() {
    this.fileClick.emit(this.messageFile());
  }
}
