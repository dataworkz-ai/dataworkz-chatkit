import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { CopyIcon, DownloadIcon } from '../../../icons';

@Component({
  selector: 'dw-ai-data-item',
  standalone: true,
  imports: [CommonModule, CopyIcon, DownloadIcon],
  templateUrl: './ai-data-item.html',
  styleUrl: './ai-data-item.scss',
})
export class AiDataItem {
  readonly data = input.required<any>();
  readonly copySuccess = signal(false);

  readonly parsedData = computed(() => {
    const rawData = this.data();
    if (typeof rawData === 'string') {
      try {
        // Handle common single quote and unquoted key patterns
        let cleaned = rawData
          .replace(/'/g, '"')
          .replace(/\\n/g, '')
          .replace(/\n/g, '')
          .replace(/(\w+):/g, '"$1":')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');

        // Handle case of multiple objects like {}{}{}
        if (cleaned.match(/}\s*{/)) {
          cleaned = '[' + cleaned.replace(/}\s*{/g, '},{') + ']';
        }

        return JSON.parse(cleaned);
      } catch (e) {
        return rawData;
      }
    }
    return rawData;
  });

  readonly formattedJson = computed(() => {
    const data = this.parsedData();
    if (typeof data === 'string') return data;
    return JSON.stringify(data, null, 2);
  });

  copyToClipboard() {
    navigator.clipboard.writeText(this.formattedJson());
    this.copySuccess.set(true);
    setTimeout(() => {
      this.copySuccess.set(false);
    }, 1000);
  }

  downloadJson() {
    const data = this.formattedJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
