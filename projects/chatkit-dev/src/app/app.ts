import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, input, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  Chatkit,
  TChatkitConversationTaskMessage,
  TItemState,
  TStepPlanItem,
  TChatkitData,
  TMessageTextPart,
  TMessageDataPart,
  TChatkitConfig,
  TChatkitAgent,
  TChatkitConversationTask,
  TChatkitLLMItem,
  TChatkitCitation,
  TChatkitFlags,
  TChatkitProps,
  TChatkitFooter,
} from 'dw-chatkit';
import {
  LLMsResponse,
  selectedAgentResponse,
  selectedConversationResponse,
  stepsResponse,
} from './data';

@Component({
  selector: 'dw-ref-link',
  standalone: true,
  template: `
    <span class="citation-link">
      <span class="citation-text">{{ this.idx() }}</span>
    </span>
  `,
  styles: `
    :host {
      display: inline;
    }
    .citation-link {
      font-size: 11px;
      font-weight: 500;
      margin: 0 4px;
      color: #6366f1;
      text-decoration: none;
      cursor: pointer;
    }
    .citation-link:hover {
      text-decoration: underline;
    }
    .citation-text {
      margin-right: 2px;
    }
  `,
})
export class CitationLink {
  readonly idx = input<number>(0);
  readonly text = input<string>('');
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Chatkit],
  templateUrl: './app.html',
  styleUrl: './app.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App {
  constructor() {
    // const messageIds = [
    //   'ab120e4c-d96d-4f75-b7ef-065c99f2471d',
    //   '7cea6815-1438-4500-863a-5c705253bc6c',
    // ];
    // let idx = 0;
    // window.setInterval(() => {
    //   this._chatkitProps.update((prev) => {
    //     return {
    //       ...prev,
    //       highlightMessageId: messageIds[idx++ % messageIds.length],
    //     };
    //   });
    // }, 2000);
  }

  private readonly _chatkitAgent = signal<TItemState<TChatkitAgent>>({
    loading: false,
    error: '',
    value: { description: selectedAgentResponse.description },
  });

  private readonly _chatkitConversation = signal<TItemState<TChatkitConversationTask[]>>({
    loading: false,
    error: '',
    value: selectedConversationResponse.tasks.map((t) => [
      t.history[0].messageID,
      t.history[1].messageID,
    ]),
  });

  private readonly _LLMs = signal<TItemState<TChatkitLLMItem[]>>({
    loading: false,
    error: '',
    value: LLMsResponse.map((llm) => ({ label: llm.name, value: llm.identifier })),
  });

  private readonly _messagesMap = signal<
    Record<string, TItemState<TChatkitConversationTaskMessage>>
  >(
    selectedConversationResponse.tasks.reduce(
      (res: Record<string, TItemState<TChatkitConversationTaskMessage>>, cur) => {
        cur.history.forEach((message) => {
          res[message.messageID] = {
            loading: false,
            error: '',
            value: {
              parts: message.parts as (TMessageTextPart | TMessageDataPart)[],
            },
          };
        });
        return res;
      },
      {},
    ),
  );

  private readonly _stepPlanItemsMap = signal<Record<string, TItemState<TStepPlanItem[]>>>(
    selectedConversationResponse.tasks.reduce(
      (res: Record<string, TItemState<TStepPlanItem[]>>, cur) => {
        cur.history.forEach((message) => {
          res[message.messageID] = {
            loading: false,
            error: '',
            value: stepsResponse.plan as TStepPlanItem[],
          };
        });
        return res;
      },
      {},
    ),
  );

  private readonly _stepPlanItemsOpenMap = signal<Record<string, boolean>>(
    selectedConversationResponse.tasks.reduce((res: Record<string, boolean>, cur) => {
      cur.history.forEach((message) => {
        res[message.messageID] = false;
      });
      return res;
    }, {}),
  );

  readonly chatkitData = computed<TChatkitData>(() => ({
    messagesMap: this._messagesMap(),
    stepPlanItemsMap: this._stepPlanItemsMap(),
    stepPlanItemsOpenMap: this._stepPlanItemsOpenMap(),
    chatkitConversation: this._chatkitConversation(),
    LLMs: this._LLMs(),
    chatkitAgent: this._chatkitAgent(),
  }));

  private readonly _chatkitCitation = signal<TChatkitCitation>({
    uniqueIdentifier: '_DW_REF_',
    component: CitationLink,
  });

  private readonly _chatkitFlags = signal<TChatkitFlags>({
    footer: {
      llmSelector: true,
      attachment: {
        computer: true,
        dataStore: true,
      },
    },
    agentMessage: {
      feedback: true,
      probe: true,
      steps: true,
    },
  });

  private readonly _chatkitProps = signal<TChatkitProps>({
    placeholder: 'Ask me anything...',
    selectedLLMId: LLMsResponse.find((llm) => llm.defaultLLM)?.identifier || '',
    userInitials: '',
    highlightMessageId: '',
  });

  private readonly _chatkitFooter = signal<TChatkitFooter>({
    userMessage: 'Hey, you good?',
    sendDisabled: false,
    userFiles: ['madhu.pdf'],
    userFilesMap: {
      'madhu.pdf': {
        ingestStatus: {
          error: '',
          loading: false,
          value: '',
        },
        uploadStatus: {
          value: '',
          error: '',
          loading: false,
        },
        documentStatus: {
          loading: false,
          value: '',
          error: '',
        },
        messageFile: {
          documentId: '',
          file: 'madhu.pdf',
          filePath: '',
          ingestUuid: '',
        },
        metadata: {
          size: 0,
        },
      },
      'test.txt': {
        ingestStatus: {
          error: '',
          loading: true,
          value: '',
        },
        uploadStatus: {
          value: '',
          error: '',
          loading: true,
        },
        documentStatus: {
          loading: true,
          value: '',
          error: '',
        },
        messageFile: {
          documentId: '',
          file: 'test.txt',
          filePath: '',
          ingestUuid: '',
        },
        metadata: {
          size: 0,
        },
      },
    },
  });

  readonly chatkitConfig = computed<TChatkitConfig>(() => ({
    chatkitCitation: this._chatkitCitation(),
    chatkitFlags: this._chatkitFlags(),
    chatkitProps: this._chatkitProps(),
    chatkitFooter: this._chatkitFooter(),
    chatkitScroll: {
      type: 'bottom',
      behavior: 'smooth',
    },
  }));

  onViewSteps(messageId: string) {
    this._stepPlanItemsOpenMap.update((prev) => {
      return { ...prev, [messageId]: !prev[messageId] };
    });
  }

  onUserMessageChange({ text }: { text: string }) {
    this._chatkitFooter.update((prev) => {
      return { ...prev, userMessage: text };
    });
  }

  onSendMessage(text: string) {
    const parts: TMessageTextPart[] = [
      {
        kind: 'text',
        text,
      },
    ];
    this._chatkitConversation.update((prev) => {
      return {
        ...prev,
        value: [...prev.value, ['2222', '3333']],
      };
    });
    this._messagesMap.update((prev) => {
      return {
        ...prev,
        '2222': {
          loading: false,
          error: '',
          value: {
            parts,
          },
        },
        '3333': {
          loading: true,
          error: '',
          value: {
            parts: [],
          },
        },
      };
    });

    // window.setInterval(() => {
    //   this._messagesMap.update((prev) => {
    //     return {
    //       ...prev,
    //       '3333': {
    //         loading: false,
    //         error: '',
    //         value: {
    //           parts: [
    //             ...prev['3333'].value.parts,
    //             {
    //               kind: 'text',
    //               text: 'Hello, how are you?',
    //             },
    //           ],
    //         },
    //       },
    //     };
    //   });
    // }, 2000);
  }

  onSelectLLM(llm: string) {
    this._chatkitProps.update((prev) => {
      return { ...prev, selectedLLMId: llm };
    });
  }

  onSelectDataStore() {
    console.log('onSelectDataStore');
  }

  onSelectComputerUpload(files: File[]) {
    console.log('onSelectComputerUpload', files);
  }

  onSelectFile(data: any) {
    console.log('onselectfile', data);
  }

  onSelectAiFile(data: any) {
    console.log('onselectaifile', data);
  }

  onViewProbe(data: any) {
    console.log('onviewprobe', data);
  }

  onFeedback(data: any) {
    console.log('onfeedback', data);
  }
}
