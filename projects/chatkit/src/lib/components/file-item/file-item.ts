import { Component, computed, input, output } from '@angular/core';
import { ErrorInfoIcon, LoaderIcon, FileIcon, CheckCircleIcon, CloseIcon } from '../icons';
import { TUserFile } from '../../typings/config';
import { ProgressBar } from '../progress-bar/progress-bar';

@Component({
  selector: 'dw-file-item',
  standalone: true,
  imports: [FileIcon, LoaderIcon, ErrorInfoIcon, CheckCircleIcon, CloseIcon, ProgressBar],
  templateUrl: './file-item.html',
  styleUrl: './file-item.scss',
})
export class FileItem {
  ingestStatus = input<TUserFile['ingestStatus']>();

  uploadStatus = input<TUserFile['uploadStatus']>();

  documentStatus = input<TUserFile['documentStatus']>();

  metadata = input<TUserFile['metadata']>();

  messageFile = input<TUserFile['messageFile']>();

  removable = input<boolean>(false);

  remove = output<void>();
  select = output<void>();

  readonly errored = computed(() => {
    return (
      !!this.ingestStatus()?.error || !!this.uploadStatus()?.error || !!this.documentStatus()?.error
    );
  });

  readonly name = computed(() => {
    return this.messageFile()?.file || '';
  });

  onRemove() {
    this.remove.emit();
  }

  onSelect() {
    this.select.emit();
  }
}
