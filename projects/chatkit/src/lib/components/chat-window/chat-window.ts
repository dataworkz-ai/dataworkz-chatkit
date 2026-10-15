import {
  Component,
  computed,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
  signal,
  effect,
  input,
} from '@angular/core';
import { Footer } from './footer/footer';
import { UserMessage } from './user-message/user-message';
import { AiMessage } from './ai-message/ai-message';
import { ChatWindowDataService } from '../../services/chat-window.data';
import { Skeleton } from '../skeleton/skeleton';
import { ConversationIcon, ChevronIcon, UploadIcon } from '../icons';
import { ChatWindowEventsService } from '../../services/chat-window.events';
import { TChatkitStarterQuestionSelection, TMessageFile } from '../../typings/data';
import {
  isScrolledUp,
  scrollToBottom,
  getDistanceFromBottom,
  centerMessageInChat,
  centerStepsInChat,
} from './utils';

type StarterFileStatus = 'loading' | 'success' | 'error';

type StarterFileState = {
  label: string;
  url: string;
  status: StarterFileStatus;
  file: File | null;
};

@Component({
  standalone: true,
  selector: 'dw-chat-message',
  imports: [UserMessage, AiMessage],
  template: `
    @if (role() === 'USER') {
      <dw-user-message [attr.id]="messageId()" [messageId]="messageId()"></dw-user-message>
    } @else {
      <dw-ai-message [attr.id]="messageId()" [taskId]="taskId()" [messageId]="messageId()"></dw-ai-message>
    }
  `,
})
export class ChatMessage {
  taskId = input<string>('');
  messageId = input<string>('');

  private readonly chatWindowDataService = inject(ChatWindowDataService);

  readonly role = computed(() => {
    return this.chatWindowDataService.messagesMap()[this.messageId()]?.value?.role;
  });
}

@Component({
  selector: 'dw-chat-window',
  imports: [Footer, Skeleton, ConversationIcon, ChevronIcon, UploadIcon, ChatMessage],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss',
})
export class ChatWindow implements AfterViewInit, OnDestroy {
  private readonly chatWindowDataService = inject(ChatWindowDataService);
  private readonly chatWindowEventsService = inject(ChatWindowEventsService);
  private readonly ngZone = inject(NgZone);
  private starterFileFetchGeneration = 0;

  readonly starterQuestions = this.chatWindowDataService.starterQuestions;
  readonly starterFileStates = signal<StarterFileState[][]>([]);
  readonly starterReady = computed(() =>
    this.starterFileStates().map((files) => files.every((file) => file.status === 'success')),
  );
  readonly starterHasError = computed(() =>
    this.starterFileStates().map((files) => files.some((file) => file.status === 'error')),
  );

  constructor() {
    effect(() => {
      const generation = ++this.starterFileFetchGeneration;
      const questions = this.starterQuestions();
      this.starterFileStates.set(
        questions.map((starter) =>
          starter.files.map((url) => ({
            label: this.fileLabel(url),
            url,
            status: 'loading' as StarterFileStatus,
            file: null,
          })),
        ),
      );
      questions.forEach((starter, questionIndex) => {
        starter.files.forEach((url, fileIndex) => {
          void this.fetchStarterFile(generation, questionIndex, fileIndex, url);
        });
      });
    });

    effect(() => {
      const request = this.chatkitScroll();
      if (!request) return;
      this.chatWindowEventsService.scrollComplete$.next();

      const chatbody = this.chatBodyRef?.nativeElement;
      if (!chatbody) return;

      switch (request.type) {
        case 'bottom':
          scrollToBottom(chatbody, request.behavior);
          break;
        case 'messageId':
          centerMessageInChat(chatbody, request.messageId, request.behavior);
          break;
        case 'steps':
          centerStepsInChat(chatbody, request.messageId, request.behavior);
          break;
      }
    });
  }

  @ViewChild('chatBody') chatBodyRef!: ElementRef<HTMLDivElement>;

  readonly showScrollDownButton = signal(false);
  readonly isDragging = signal(false);
  private dragCounter = 0;

  private mutationObserver: MutationObserver | undefined = undefined;

  private chatkitScroll = computed(() => {
    return this.chatWindowDataService.chatkitScroll();
  });

  readonly chatkitConversationLoading = computed(() => {
    return this.chatWindowDataService.chatkitConversation()?.loading;
  });

  readonly chatkitConversationError = computed(() => {
    return this.chatWindowDataService.chatkitConversation()?.error;
  });

  readonly chatkitConversation = computed(() => {
    return this.chatWindowDataService.chatkitConversation().value;
  });

  readonly chatkitAgentLoading = computed(() => {
    return this.chatWindowDataService.chatkitAgent().loading;
  });

  readonly chatkitAgentError = computed(() => {
    return this.chatWindowDataService.chatkitAgent().error;
  });

  readonly chatkitAgentDescription = computed(() => {
    return this.chatWindowDataService.chatkitAgent().value.description;
  });

  readonly showFooter = computed(() => {
    return !!this.chatWindowDataService.chatkitFlags()?.footer;
  });

  readonly showAttachmentComputer = computed(() => {
    return !!this.chatWindowDataService.chatkitFlags()?.footer?.attachment?.computer;
  });

  // Footer data signals
  readonly footerUserText = computed(() => {
    return this.chatWindowDataService.chatkitFooter().userMessage || '';
  });

  readonly footerUserFiles = computed(() => {
    return this.chatWindowDataService.chatkitFooter().userFiles || [];
  });

  readonly footerUserFilesMap = computed(() => {
    return this.chatWindowDataService.chatkitFooter().userFilesMap || {};
  });

  readonly footerUserMessageSuggestions = computed(() => {
    return this.chatWindowDataService.chatkitFooter().userMessageSuggestions || [];
  });

  readonly footerPlaceholder = computed(() => {
    return this.chatWindowDataService.chatkitProps().placeholder || 'Type here...';
  });

  readonly footerSelectedLLMId = computed(() => {
    return this.chatWindowDataService.chatkitProps().selectedLLMId || '';
  });

  readonly footerLLMs = computed(() => {
    return this.chatWindowDataService.LLMs().value;
  });

  readonly footerLLMsLoading = computed(() => {
    return this.chatWindowDataService.LLMs().loading;
  });

  readonly footerLLMsErrored = computed(() => {
    return !!this.chatWindowDataService.LLMs().error;
  });

  readonly footerDisableSend = computed(() => {
    return !!this.chatWindowDataService.chatkitFooter()?.sendDisabled;
  });

  readonly footerShowAttachment = computed(() => {
    return !!this.chatWindowDataService.chatkitFlags()?.footer?.attachment;
  });

  readonly footerShowAttachmentDataStore = computed(() => {
    return !!this.chatWindowDataService.chatkitFlags()?.footer?.attachment?.dataStore;
  });

  readonly footerShowLLMSelector = computed(() => {
    return !!this.chatWindowDataService.chatkitFlags()?.footer?.llmSelector;
  });

  readonly footerAcceptedTypes = computed(() => {
    const types = this.chatWindowDataService.chatkitProps().allowedFileTypes || [];
    return types.join(',');
  });

  readonly footerShowTextInput = computed(() => {
    return this.chatWindowDataService.chatkitFlags()?.footer?.textInput !== false;
  });

  // Footer event handlers
  onFooterSendMessage(message: string) {
    this.chatWindowEventsService.sendMessage$.next(message);
  }

  onFooterUserMessageChange(value: { event: Event; text: string }) {
    this.chatWindowEventsService.userMessageChange$.next(value);
  }

  onFooterSelectLLM(value: string) {
    this.chatWindowEventsService.selectLLM$.next(value);
  }

  onFooterSelectDataStore() {
    this.chatWindowEventsService.selectDataStore$.next();
  }

  onFooterSelectComputerUpload(files: File[]) {
    this.chatWindowEventsService.selectComputerUpload$.next(files);
  }

  onFooterRemoveUserFile(filename: string) {
    this.chatWindowEventsService.removeUserFile$.next(filename);
  }

  onFooterSelectFile(file: TMessageFile | undefined) {
    this.chatWindowEventsService.selectFile$.next(file);
  }

  selectStarterQuestion(index: number): void {
    if (!this.starterReady()[index]) return;
    const starter = this.starterQuestions()[index];
    const selection: TChatkitStarterQuestionSelection = {
      question: starter.question,
      files: this.starterFileStates()[index]
        .map((state) => state.file)
        .filter((file): file is File => file !== null),
    };
    this.chatWindowEventsService.userMessageChange$.next({
      event: new Event('input'),
      text: starter.question,
    });
    this.chatWindowEventsService.starterQuestionSelect$.next(selection);
  }

  private fileLabel(url: string): string {
    try {
      return decodeURIComponent(
        new URL(url, window.location.href).pathname.split('/').pop() || 'file',
      );
    } catch {
      return url.split('/').pop() || 'file';
    }
  }

  private async fetchStarterFile(
    generation: number,
    questionIndex: number,
    fileIndex: number,
    url: string,
  ): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      this.updateStarterFile(
        generation,
        questionIndex,
        fileIndex,
        'success',
        new File([blob], this.fileLabel(url), {
          type: blob.type || 'application/octet-stream',
        }),
      );
    } catch {
      this.updateStarterFile(generation, questionIndex, fileIndex, 'error', null);
    }
  }

  private updateStarterFile(
    generation: number,
    questionIndex: number,
    fileIndex: number,
    status: StarterFileStatus,
    file: File | null,
  ): void {
    if (generation !== this.starterFileFetchGeneration) return;
    this.starterFileStates.update((rows) =>
      rows.map((row, rowIndex) =>
        rowIndex === questionIndex
          ? row.map((item, itemIndex) =>
              itemIndex === fileIndex ? { ...item, status, file } : item,
            )
          : row,
      ),
    );
  }

  ngAfterViewInit() {
    this.scrollListener();

    this.setupMutationObserver();
    this.ngZone.runOutsideAngular(() => {
      this.chatBodyRef.nativeElement?.addEventListener('scroll', this.scrollListener, {
        passive: true,
      });
    });
  }

  ngOnDestroy() {
    this.chatBodyRef?.nativeElement?.removeEventListener('scroll', this.scrollListener);
    this.mutationObserver?.disconnect();
  }

  onScrollButton() {
    this.chatWindowDataService.setChatkitScroll({ type: 'bottom', behavior: 'smooth' });
  }

  private scrollListener = () => {
    const el = this.chatBodyRef.nativeElement;
    this.showScrollDownButton.set(isScrolledUp(el, 500));
  };

  private setupMutationObserver() {
    const chatBody = this.chatBodyRef.nativeElement;

    if (!chatBody) return;

    this.mutationObserver = new MutationObserver((mutations) => {
      // Starter questions belong to the empty state, not the conversation
      // timeline. Rendering them must not trigger the timeline's follow-bottom
      // behavior before the user has sent a message.
      if (!this.chatkitConversation()?.length) return;
      const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);

      if (hasAddedNodes && getDistanceFromBottom(chatBody) < 100) {
        setTimeout(() => {
          this.chatWindowDataService.setChatkitScroll({ type: 'bottom', behavior: 'smooth' });
        }, 100);
      }
    });

    this.ngZone.runOutsideAngular(() => {
      this.mutationObserver!.observe(chatBody, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    });
  }

  onDragOver(event: DragEvent) {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    event.stopPropagation();
  }

  onDragEnter(event: DragEvent) {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter++;
    if (this.dragCounter === 1) {
      this.isDragging.set(true);
    }
  }

  onDragLeave(event: DragEvent) {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.isDragging.set(false);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter = 0;
    this.isDragging.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const filesArray = Array.from(event.dataTransfer.files);
      this.chatWindowEventsService.selectComputerUpload$.next(filesArray);
    }
  }
}
