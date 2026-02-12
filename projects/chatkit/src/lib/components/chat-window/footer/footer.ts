import { Component, computed, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { ChatWindowEventsService } from '../../../services/chat-window.events';
import { ChatWindowDataService } from '../../../services/chat-window.data';
import { Dropdown } from '../../dropdown/dropdown';
import { Popover } from '../../popover/popover';
import { SendArrowIcon, PaperclipIcon, DocumentIcon, UploadIcon } from '../../icons';
import { UserFileItem } from './user-file-item/user-file-item';

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

  private suggestionIndex = -1;
  private originalUserText = '';
  private sessionSuggestions: string[] = [];

  constructor() {
    effect(() => {
      if (
        !this.sessionSuggestions.length ||
        this.sessionSuggestions.length < this.userMessageSuggestions().length
      ) {
        this.sessionSuggestions = [...this.userMessageSuggestions()];
      }
    });
  }

  readonly userText = computed(() => {
    return this.chatWindowDataService.chatkitFooter().userMessage || '';
  });

  readonly userFiles = computed(() => {
    return this.chatWindowDataService.chatkitFooter().userFiles || [];
  });

  readonly userFilesMap = computed(() => {
    return this.chatWindowDataService.chatkitFooter().userFilesMap || {};
  });

  readonly userMessageSuggestions = computed(() => {
    return this.chatWindowDataService.chatkitFooter().userMessageSuggestions || [];
  });

  readonly placeholder = computed(() => {
    return this.chatWindowDataService.chatkitProps().placeholder || 'Type here...';
  });

  private readonly chatWindowEventsService = inject(ChatWindowEventsService);

  private readonly chatWindowDataService = inject(ChatWindowDataService);

  readonly selectedLLMId = computed(() => {
    return this.chatWindowDataService.chatkitProps().selectedLLMId || '';
  });

  readonly LLMs = computed(() => {
    return this.chatWindowDataService.LLMs().value;
  });

  readonly LLMsLoading = computed(() => {
    return this.chatWindowDataService.LLMs().loading;
  });

  readonly LLMsErrored = computed(() => {
    return !!this.chatWindowDataService.LLMs().error;
  });

  readonly disableSend = computed(() => {
    return !!this.chatWindowDataService.chatkitFooter()?.sendDisabled;
  });

  readonly showAttachment = computed(() => {
    return !!this.chatWindowDataService.chatkitFlags()?.footer?.attachment;
  });

  readonly showAttachmentComputer = computed(() => {
    return !!this.chatWindowDataService.chatkitFlags()?.footer?.attachment?.computer;
  });

  readonly showAttachmentDataStore = computed(() => {
    return !!this.chatWindowDataService.chatkitFlags()?.footer?.attachment?.dataStore;
  });

  readonly showLLMSelector = computed(() => {
    return !!this.chatWindowDataService.chatkitFlags()?.footer?.llmSelector;
  });

  readonly acceptedTypes = computed(() => {
    const types = this.chatWindowDataService.chatkitProps().allowedFileTypes || [];
    return types.join(',');
  });

  onLLMChange(value: string) {
    this.chatWindowEventsService.selectLLM$.next(value);
  }

  private resetSuggestions = () => {
    this.suggestionIndex = -1;
    this.originalUserText = '';
    this.sessionSuggestions = this.userMessageSuggestions();
  };

  onSend() {
    if (this.disableSend()) {
      return;
    }
    this.chatWindowEventsService.sendMessage$.next(this.userText());
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

    this.chatWindowEventsService.userMessageChange$.next({
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
    this.chatWindowEventsService.userMessageChange$.next({
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
    this.chatWindowEventsService.selectDataStore$.next();
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
      this.chatWindowEventsService.selectComputerUpload$.next(filesArray);
      // Reset input to allow selecting the same file again
      input.value = '';
    }
  }
}
