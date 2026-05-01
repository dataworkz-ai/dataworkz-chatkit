import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { IMessageFilePart } from '../../../../typings/data';
import { CopyIcon, DownloadIcon, FileIcon } from '../../../icons';

const convertImageUrlToBlobViaCanvas = async (url: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // required to prevent tainted canvas
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert image to blob'));
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for canvas'));
    img.src = url;
  });
};

@Component({
  selector: 'dw-ai-file-item',
  standalone: true,
  imports: [CommonModule, CopyIcon, DownloadIcon, FileIcon],
  templateUrl: './ai-file-item.html',
  styleUrl: './ai-file-item.scss',
})
export class AiFileItem {
  readonly part = input.required<IMessageFilePart>();

  readonly copySuccess = signal(false);

  readonly file = computed(() => this.part().file);

  readonly mimeType = computed(() => {
    return this.file().mimeType || this.part().metadata?.mimetype || '';
  });

  readonly isImage = computed(() => this.mimeType().startsWith('image/'));

  readonly fileName = computed(() => {
    return this.file().fileName || this.file().name || 'File';
  });

  readonly fileUrl = computed(() => {
    const file = this.file();
    let url = file.url || file.uri || (file.bytes ? file.bytes : '');

    if (url && !url.startsWith('http') && !url.startsWith('data:')) {
      const mime = this.mimeType();
      url = `data:${mime};base64,${url}`;
    }
    return url;
  });

  copyToClipboard = async () => {
    try {
      let blob: any;

      if (this.fileUrl().startsWith('data:')) {
        blob = await fetch(this.fileUrl()).then((r) => r.blob());
      } else {
        try {
          const response = await fetch(this.fileUrl(), { mode: 'cors' });
          if (!response.ok) throw new Error('Image fetch failed');
          blob = await response.blob();
        } catch (corsError) {
          console.warn('CORS fetch failed, using canvas fallback...');
          blob = await convertImageUrlToBlobViaCanvas(this.fileUrl());
        }
      }

      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 1000);
    } catch (err) {
      console.error('Image copy failed:', err);
      try {
        await navigator.clipboard.writeText(this.fileUrl());
        this.copySuccess.set(true);
        setTimeout(() => this.copySuccess.set(false), 1000);
      } catch {}
    }
  };

  downloadFile(event: MouseEvent) {
    event.stopPropagation();
    const url = this.fileUrl();
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = this.fileName();
      a.click();
    }
  }
}
