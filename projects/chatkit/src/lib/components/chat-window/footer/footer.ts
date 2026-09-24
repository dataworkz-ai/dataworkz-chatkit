import { Component, effect, ElementRef, input, output, ViewChild } from '@angular/core';
import { Dropdown } from '../../dropdown/dropdown';
import { Popover } from '../../popover/popover';
import { SendArrowIcon, PaperclipIcon, DocumentIcon, UploadIcon } from '../../icons';
import { UserFileItem } from './user-file-item/user-file-item';
import { TChatkitLLMItem, TMessageFile } from '../../../typings/data';
import { TUserFile } from '../../../typings/config';

@Component({
  selector: 'dw-chat-footer',
  imports: [
    Dropdown,
    Popover,
    SendArrowIcon,
    PaperclipIcon,
    DocumentIcon,
    UploadIcon,
    UserFileItem,
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('textareaRef') textareaRef?: ElementRef<HTMLTextAreaElement>;
  @ViewChild(Popover) popover?: Popover;

  readonly userText = input<string>('');
  readonly userFiles = input<string[]>([]);
  readonly userFilesMap = input<Record<string, TUserFile>>({});
  readonly userMessageSuggestions = input<string[]>([]);
  readonly placeholder = input<string>('Type here...');
  readonly selectedLLMId = input<string>('');
  readonly LLMs = input<TChatkitLLMItem[]>([]);
  readonly LLMsLoading = input<boolean>(false);
  readonly LLMsErrored = input<boolean>(false);
  readonly disableSend = input<boolean>(false);
  readonly showAttachment = input<boolean>(false);
  readonly showAttachmentComputer = input<boolean>(false);
  readonly showAttachmentDataStore = input<boolean>(false);
  readonly showLLMSelector = input<boolean>(false);
  readonly acceptedTypes = input<string>('');
  readonly showTextInput = input<boolean>(true);

  readonly sendMessage = output<string>();
  readonly userMessageChange = output<{ event: Event; text: string }>();
  readonly selectLLM = output<string>();
  readonly selectDataStore = output<void>();
  readonly selectComputerUpload = output<File[]>();
  readonly removeUserFile = output<string>();
  readonly selectFile = output<TMessageFile | undefined>();

  private suggestionIndex = -1;
  private originalUserText = '';
  private sessionSuggestions: string[] = [];

  constructor() {
    effect(() => {
      this.sessionSuggestions = [...this.userMessageSuggestions()];
      this.suggestionIndex = -1;
    });
  }

  onLLMChange(value: string) {
    this.selectLLM.emit(value);
  }

  private resetSuggestions = () => {
    this.suggestionIndex = -1;
    this.originalUserText = '';
    this.sessionSuggestions = [...this.userMessageSuggestions()];
  };

  onSend() {
    if (this.disableSend()) {
      return;
    }
    this.sendMessage.emit(this.userText());
    this.resetSuggestions();
  }

  onInputChange(event: Event) {
    const text = (event.target as HTMLTextAreaElement).value;

    if (!text) {
      this.resetSuggestions();
    } else if (this.suggestionIndex === -1) {
      this.originalUserText = text;
    } else if (this.sessionSuggestions.length > 0) {
      this.sessionSuggestions[this.suggestionIndex] = text;
    }

    this.userMessageChange.emit({
      event,
      text,
    });
  }

  onKeyDown(event: KeyboardEvent) {
    const textarea = this.textareaRef?.nativeElement;

    if (
      event.key === 'ArrowUp' &&
      textarea &&
      textarea.selectionStart === 0 &&
      textarea.selectionEnd === 0 &&
      this.sessionSuggestions.length > 0
    ) {
      event.preventDefault();
      if (this.suggestionIndex === -1) {
        this.originalUserText = textarea.value;
        this.suggestionIndex = this.sessionSuggestions.length - 1;
      } else if (this.suggestionIndex > 0) {
        this.suggestionIndex--;
      }
      this.updateMessageFromSuggestion(this.sessionSuggestions[this.suggestionIndex], 'start');
    } else if (
      event.key === 'ArrowDown' &&
      textarea &&
      textarea.selectionStart === textarea.value.length &&
      textarea.selectionEnd === textarea.value.length &&
      this.sessionSuggestions.length > 0
    ) {
      if (this.suggestionIndex !== -1) {
        event.preventDefault();
        this.suggestionIndex++;
        if (this.suggestionIndex >= this.sessionSuggestions.length) {
          this.suggestionIndex = -1;
          this.updateMessageFromSuggestion(this.originalUserText, 'end');
        } else {
          this.updateMessageFromSuggestion(this.sessionSuggestions[this.suggestionIndex], 'end');
        }
      }
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.disableSend()) {
        return;
      }
      this.onSend();
    }
  }

  private updateMessageFromSuggestion(text: string, caretPosition: 'start' | 'end') {
    this.userMessageChange.emit({
      event: new Event('input'),
      text,
    });

    setTimeout(() => {
      const textarea = this.textareaRef?.nativeElement;
      if (textarea) {
        const pos = caretPosition === 'start' ? 0 : text.length;
        textarea.setSelectionRange(pos, pos);
      }
    }, 0);
  }

  onAttachmentClick = () => {
    this.popover?.toggle();
  };

  onSelectDataStore() {
    this.selectDataStore.emit();
    this.popover?.close();
  }

  onUploadFile() {
    this.popover?.close();
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const filesArray = Array.from(input.files);
      this.selectComputerUpload.emit(filesArray);
      input.value = '';
    }
  }

  onRemoveUserFile(filename: string) {
    this.removeUserFile.emit(filename);
  }

  onSelectFile(file: TMessageFile | undefined) {
    this.selectFile.emit(file);
  }
}
