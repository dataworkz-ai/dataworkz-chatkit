import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
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
  @ViewChild(Popover) popover?: Popover;

  readonly userText = computed(() => {
    return this.chatWindowDataService.chatkitFooter().userMessage || '';
  });

  readonly userFiles = computed(() => {
    return this.chatWindowDataService.chatkitFooter().userFiles || [];
  });

  readonly userFilesMap = computed(() => {
    return this.chatWindowDataService.chatkitFooter().userFilesMap || {};
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
    // return (
    //   !this.userText() ||
    //   this.chatWindowDataService.chatkitConversation().loading ||
    //   !!this.chatWindowDataService.chatkitConversation().error
    // );
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

  onSend() {
    if (this.disableSend()) {
      return;
    }
    this.chatWindowEventsService.sendMessage$.next(this.userText());
  }

  onInputChange(event: Event) {
    this.chatWindowEventsService.userMessageChange$.next({
      event,
      text: (event.target as HTMLTextAreaElement).value,
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.disableSend()) {
        return;
      }
      this.onSend();
    }
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
