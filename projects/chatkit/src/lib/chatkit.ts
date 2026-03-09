import { Component, EventEmitter, inject, Input, Output, ViewEncapsulation } from '@angular/core';
import { ChatWindow } from './components/chat-window/chat-window';
import { ChatWindowDataService } from './services/chat-window.data';
import { ChatWindowEventsService } from './services/chat-window.events';
import { TChatkitConfig } from './typings/config';
import { TMessageFile, TChatkitData, IMessageFilePart, TAdditionalFeedback, THitlResolution } from './typings/data';

@Component({
  selector: 'dw-chatkit',
  standalone: true,
  imports: [ChatWindow],
  providers: [ChatWindowDataService, ChatWindowEventsService],
  template: `<dw-chat-window></dw-chat-window>`,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class Chatkit {
  constructor() {
    this.chatWindowEventsService.userMessageChange$.subscribe({
      next: (value) => {
        this.userMessageChange.emit(value);
      },
    });

    this.chatWindowEventsService.sendMessage$.subscribe({
      next: (value) => {
        this.sendMessage.emit(value);
      },
    });

    this.chatWindowEventsService.selectLLM$.subscribe({
      next: (value) => {
        this.selectLLM.emit(value);
      },
    });

    this.chatWindowEventsService.viewSteps$.subscribe({
      next: (value) => {
        this.viewSteps.emit(value);
      },
    });

    this.chatWindowEventsService.selectDataStore$.subscribe({
      next: () => {
        this.selectDataStore.emit();
      },
    });

    this.chatWindowEventsService.removeUserFile$.subscribe({
      next: (value) => {
        this.removeUserFile.emit(value);
      },
    });

    this.chatWindowEventsService.selectComputerUpload$.subscribe({
      next: (value) => {
        this.selectComputerUpload.emit(value);
      },
    });

    this.chatWindowEventsService.selectAiFile$.subscribe({
      next: (value) => {
        this.selectAiFile.emit(value);
      },
    });

    this.chatWindowEventsService.selectFile$.subscribe({
      next: (value) => {
        this.selectFile.emit(value);
      },
    });

    this.chatWindowEventsService.feedback$.subscribe({
      next: (value) => {
        this.feedback.emit(value);
      },
    });

    this.chatWindowEventsService.viewProbe$.subscribe({
      next: (value) => {
        this.viewProbe.emit(value);
      },
    });

    this.chatWindowEventsService.scrollComplete$.subscribe({
      next: () => {
        this.viewProbe.emit();
      },
    });

    this.chatWindowEventsService.hitlResolve$.subscribe({
      next: (value) => {
        this.hitlResolve.emit(value);
      },
    });

  }

  private readonly chatWindowDataService = inject(ChatWindowDataService);
  private readonly chatWindowEventsService = inject(ChatWindowEventsService);

  @Input() set chatkitConfig(chatkitConfig: TChatkitConfig) {
    this.chatWindowDataService.setChatkitFlags(chatkitConfig?.chatkitFlags || {});
    this.chatWindowDataService.setChatkitProps(chatkitConfig?.chatkitProps || {});
    this.chatWindowDataService.setChatkitCitation(chatkitConfig?.chatkitCitation || {});
    this.chatWindowDataService.setChatkitFooter(chatkitConfig?.chatkitFooter || {});
    this.chatWindowDataService.setChatkitScroll(chatkitConfig?.chatkitScroll || undefined);
  }

  @Input() set chatkitData(chatkitData: TChatkitData) {
    this.chatWindowDataService.setChatkitConversation(
      chatkitData?.chatkitConversation || {
        loading: false,
        error: '',
        value: [],
      },
    );
    this.chatWindowDataService.setLLMs(
      chatkitData?.LLMs || {
        loading: false,
        error: '',
        value: [],
      },
    );
    this.chatWindowDataService.setChatkitAgent(
      chatkitData?.chatkitAgent || {
        loading: false,
        error: '',
        value: {
          description: '',
        },
      },
    );
    this.chatWindowDataService.setMessagesMap(chatkitData?.messagesMap || {});
    this.chatWindowDataService.setStepPlanItemsMap(chatkitData?.stepPlanItemsMap || {});
    this.chatWindowDataService.setStepPlanItemsOpenMap(chatkitData?.stepPlanItemsOpenMap || {});
    this.chatWindowDataService.setHitlRequestsMap(chatkitData?.hitlRequestsMap || {});
  }

  @Output() sendMessage = new EventEmitter<string>();
  @Output() userMessageChange = new EventEmitter<{ event: Event; text: string }>();
  @Output() selectLLM = new EventEmitter<string>();
  @Output() viewSteps = new EventEmitter<{ taskId: string; messageId: string }>();
  @Output() selectDataStore = new EventEmitter<void>();
  @Output() removeUserFile = new EventEmitter<string>();
  @Output() selectFile = new EventEmitter<TMessageFile | undefined>();
  @Output() selectAiFile = new EventEmitter<IMessageFilePart>();
  @Output() selectComputerUpload = new EventEmitter<File[]>();
  @Output() viewProbe = new EventEmitter<{ taskId: string; messageId: string }>();
  @Output() feedback = new EventEmitter<{
    taskId: string;
    messageId: string;
    thumbsUpOrDown?: number;
    additionalFeedback?: TAdditionalFeedback;
  }>();
  @Output() scrollComplete = new EventEmitter<void>();
  @Output() hitlResolve = new EventEmitter<{
    taskId: string;
    messageId: string;
    requestId: string;
    resolution: THitlResolution;
  }>();
}
