import {
  Component,
  computed,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  signal,
  input,
  afterNextRender,
  Injector,
} from '@angular/core';
import { Footer } from './footer/footer';
import { UserMessage } from './user-message/user-message';
import { AiMessage } from './ai-message/ai-message';
import { ChatWindowDataService } from '../../services/chat-window.data';
import { Skeleton } from '../skeleton/skeleton';
import { AgentBotIcon, ChevronIcon, CommentsIcon, UploadIcon } from '../icons';
import { AgentQuestion, TAgentQuestionSelect } from './agent-question/agent-question';
import { ChatWindowEventsService } from '../../services/chat-window.events';
import { TMessageFile } from '../../typings/data';
import { ChatScrollService } from './chat-scroll';

@Component({
  standalone: true,
  selector: 'dw-chat-message',
  imports: [UserMessage, AiMessage],
  template: `
    @if (role() === 'USER') {
      <dw-user-message [attr.id]="messageId()" [messageId]="messageId()"></dw-user-message>
    } @else {
      <dw-ai-message
        [attr.id]="messageId()"
        [taskId]="taskId()"
        [messageId]="messageId()"
      ></dw-ai-message>
    }
  `,
})
export class ChatMessage implements OnDestroy {
  taskId = input<string>('');
  messageId = input<string>('');

  private readonly chatWindowDataService = inject(ChatWindowDataService);
  private readonly chatScrollService = inject(ChatScrollService);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => this.chatScrollService.observe(this.el.nativeElement));
  }

  ngOnDestroy() {
    this.chatScrollService.unobserve(this.el.nativeElement);
  }

  readonly role = computed(() => {
    return this.chatWindowDataService.messagesMap()[this.messageId()]?.value?.role;
  });
}

@Component({
  selector: 'dw-chat-window',
  imports: [
    Footer,
    Skeleton,
    AgentBotIcon,
    CommentsIcon,
    ChevronIcon,
    UploadIcon,
    ChatMessage,
    AgentQuestion,
  ],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss',
  providers: [ChatScrollService],
})
export class ChatWindow implements AfterViewInit, OnDestroy {
  private readonly chatWindowDataService = inject(ChatWindowDataService);
  private readonly chatWindowEventsService = inject(ChatWindowEventsService);
  private readonly chatScrollService = inject(ChatScrollService);
  private readonly injector = inject(Injector);

  @ViewChild('chatBody') chatBodyRef!: ElementRef<HTMLDivElement>;
  @ViewChild('chatSpacer') chatSpacerRef!: ElementRef<HTMLDivElement>;

  readonly showScrollDownButton = this.chatScrollService.showScrollDownButton;
  readonly isDragging = signal(false);
  private dragCounter = 0;

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

  readonly chatkitAgentIntro = computed(() => {
    const agent = this.chatWindowDataService.chatkitAgent().value;
    return agent?.purpose || agent?.description || '';
  });

  readonly chatkitAgentQuestions = computed(() => {
    return this.chatWindowDataService.chatkitAgent().value?.questions || [];
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

  // questions can't be picked while a footer file is still uploading / ingesting
  readonly footerUserFilesLoading = computed(() => {
    const filesMap = this.footerUserFilesMap();
    return this.footerUserFiles().some((filename) => {
      const file = filesMap[filename];
      return (
        !!file?.uploadStatus?.loading ||
        !!file?.ingestStatus?.loading ||
        !!file?.documentStatus?.loading
      );
    });
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

  onAgentQuestionSelect({ question, files, hasFiles }: TAgentQuestionSelect) {
    // a question replaces the footer contents, so clear the files already attached first
    [...this.footerUserFiles()].forEach((filename) => {
      this.chatWindowEventsService.removeUserFile$.next(filename);
    });

    this.chatWindowEventsService.userMessageChange$.next({
      event: new Event('input'),
      text: question,
    });
    if (files.length) {
      this.chatWindowEventsService.selectComputerUpload$.next(files);
    }

    // a message-only question is sent right away. Hosts usually disable send while the
    // composer is empty, so wait for the filled text to come back down before checking;
    // if the host still blocks sending (no LLM, files loading...) the text stays in the footer
    if (!hasFiles) {
      afterNextRender(
        () => {
          if (this.footerUserText() === question && !this.footerDisableSend()) {
            this.chatWindowEventsService.sendMessage$.next(question);
          }
        },
        { injector: this.injector },
      );
    }
  }

  ngAfterViewInit() {
    this.chatScrollService.attach(this.chatBodyRef.nativeElement, this.chatSpacerRef.nativeElement);
  }

  ngOnDestroy() {
    this.chatScrollService.detach();
  }

  onScrollButton() {
    this.chatScrollService.onScrollDownButton();
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
