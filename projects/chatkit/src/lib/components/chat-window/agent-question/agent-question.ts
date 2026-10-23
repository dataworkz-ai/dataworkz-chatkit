import { Component, computed, effect, input, OnDestroy, output, signal } from '@angular/core';
import { FileItem } from '../../file-item/file-item';
import { ArrowUpRightIcon } from '../../icons';
import { TItemState } from '../../../typings/common';
import { TChatkitAgentQuestion } from '../../../typings/data';

export type TAgentQuestionSelect = {
  question: string;
  // files that loaded; failed ones are left out
  files: File[];
  // whether the question was configured with any files at all
  hasFiles: boolean;
};

type TQuestionFile = {
  url: string;
  name: string;
  status: TItemState<string>;
  file?: File;
};

const getFileName = (url: string) => {
  const path = url.split(/[?#]/)[0].replace(/\/+$/, '');
  const name = path.substring(path.lastIndexOf('/') + 1);
  try {
    return decodeURIComponent(name) || url;
  } catch {
    return name || url;
  }
};

@Component({
  selector: 'dw-agent-question',
  standalone: true,
  imports: [FileItem, ArrowUpRightIcon],
  templateUrl: './agent-question.html',
  styleUrl: './agent-question.scss',
})
export class AgentQuestion implements OnDestroy {
  readonly question = input.required<TChatkitAgentQuestion>();

  readonly disabled = input<boolean>(false);

  readonly questionSelect = output<TAgentQuestionSelect>();

  readonly files = signal<TQuestionFile[]>([]);

  readonly ready = computed(
    () => !this.disabled() && this.files().every((f) => !f.status.loading),
  );

  private abortController?: AbortController;

  constructor() {
    effect(() => {
      this.loadFiles(this.question().files || []);
    });
  }

  ngOnDestroy() {
    this.abortController?.abort();
  }

  private loadFiles(urls: string[]) {
    this.abortController?.abort();
    const controller = new AbortController();
    this.abortController = controller;

    this.files.set(
      urls.map((url) => ({
        url,
        name: getFileName(url),
        status: { loading: true, value: '', error: '' },
      })),
    );

    urls.forEach((url, index) => {
      fetch(url, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load file (${response.status})`);
          }
          return response.blob();
        })
        .then((blob) => {
          const name = getFileName(url);
          const file = new File([blob], name, { type: blob.type });
          this.updateFile(index, { status: { loading: false, value: name, error: '' }, file });
        })
        .catch((error) => {
          if (controller.signal.aborted) return;
          this.updateFile(index, {
            status: { loading: false, value: '', error: error?.message || 'Failed to load file' },
          });
        });
    });
  }

  private updateFile(index: number, value: Partial<TQuestionFile>) {
    this.files.update((files) => files.map((f, i) => (i === index ? { ...f, ...value } : f)));
  }

  onSelect() {
    if (!this.ready()) return;
    this.questionSelect.emit({
      question: this.question().question,
      files: this.files()
        .map((f) => f.file)
        .filter((f): f is File => !!f),
      hasFiles: this.files().length > 0,
    });
  }
}
