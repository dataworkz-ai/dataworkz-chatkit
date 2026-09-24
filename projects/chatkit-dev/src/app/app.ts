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
  THitlRequestItem,
  THitlAutoResolutionRule,
  THitlAutoResolutionEvent,
} from 'dw-chatkit';
import { LLMsResponse } from './data/LLMsResponse';
import { selectedAgentResponse } from './data/selectedAgentResponse';
import { selectedConversationResponse } from './data/selectedConversationResponse';
import { stepsResponse } from './data/stepsResponse';

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
    // Set cancelled HITL requests
    const cancelledIds = [
      'cancelled-approval',
      'cancelled-approval-mods',
      'cancelled-input',
      'cancelled-clarify',
    ];
    this._hitlRequestsMap.update((prev) => {
      const updated = { ...prev };
      for (const id of cancelledIds) {
        if (updated[id]) {
          updated[id] = { ...updated[id], resolution: 'cancelled' };
        }
      }
      return updated;
    });

    // Simulate dynamic status updates
    this._simulateStatusProgress();
  }

  private _simulateStatusProgress() {
    let tick = 0;
    setInterval(() => {
      tick++;
      this._stepPlanItemsMap.update((prev) => {
        const updated: Record<string, TItemState<TStepPlanItem[]>> = {};
        for (const [key, itemState] of Object.entries(prev)) {
          const plan = JSON.parse(JSON.stringify(itemState.value)) as any[];
          for (const item of plan) {
            if (item.type !== 'Iteration' || !item.executions) continue;
            for (const exec of item.executions) {
              if (!exec.executions) continue;
              for (const [k, entry] of Object.entries(exec.executions) as any[]) {
                if (entry.type !== 'Status') continue;
                // Update body label dynamically
                const bodies: Record<string, string[]> = {
                  'extraction-progress': [
                    'Extracting fields from invoice',
                    'Reading line items',
                    'Parsing vendor details',
                    'Extracting amounts',
                    'Finalizing extraction',
                  ],
                  'validation-check': [
                    'Running validation rules',
                    'Checking required fields',
                    'Validating amounts',
                    'Cross-referencing PO numbers',
                    'Verifying tax calculations',
                    'Checking duplicates',
                    'Validating dates',
                    'Final validation pass',
                  ],
                  'db-lookup': [
                    'Looking up vendor records',
                    'Querying invoices table',
                    'Matching purchase orders',
                    'Verifying payment history',
                  ],
                  'processing': [
                    'Processing batch',
                    'Aggregating results',
                    'Computing totals',
                    'Generating summary',
                  ],
                };
                const bodyList = bodies[entry.name];
                if (bodyList) {
                  entry.body = bodyList[tick % bodyList.length];
                }
                // Update progress if determinate
                if (entry.progress?.total) {
                  const total = parseInt(entry.progress.total, 10);
                  if (!isNaN(total)) {
                    entry.progress = {
                      ...entry.progress,
                      current: tick % (total + 1),
                    };
                  }
                }
              }
            }
          }
          updated[key] = { ...itemState, value: plan };
        }
        return updated;
      });
    }, 2000);
  }

  private readonly _chatkitAgent = signal<TItemState<TChatkitAgent>>({
    loading: false,
    error: '',
    value: { description: selectedAgentResponse.description },
  });

  private readonly _chatkitConversation = signal<TItemState<TChatkitConversationTask[]>>({
    loading: false,
    error: '',
    value: selectedConversationResponse.tasks.map((t) => ({
      taskId: t.id,
      messageIds: t.history.map((h) => h.messageID),
    })),
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
        cur.history.forEach((message: any) => {
          res[message.messageID] = {
            loading: false,
            error: '',
            value: {
              role: message.role as any,
              parts: message.parts as (TMessageTextPart | TMessageDataPart)[],
              timestamp: message.timestamp,
              hitlRequestIds: [
                ...(message.metadata?.hitlRequests?.map((r: any) => r.requestId) || []),
                ...(message.metadata?.autoResolvableHITLRequests?.map(
                  (r: any) => r.request.requestId,
                ) || []),
              ],
            },
          };
        });
        return res;
      },
      {} as Record<string, TItemState<TChatkitConversationTaskMessage>>,
    ),
  );

  private readonly _hitlRequestsMap = signal<Record<string, THitlRequestItem>>(
    selectedConversationResponse.tasks.reduce(
      (res: Record<string, THitlRequestItem>, cur) => {
        cur.history.forEach((message: any) => {
          message?.metadata?.hitlRequests?.forEach?.((hitlRequest: any) => {
            res[hitlRequest.requestId] = {
              request: hitlRequest,
              resolution: (() => {
                let resolution = undefined;
                selectedConversationResponse.tasks.forEach((task: any) => {
                  task.history.forEach((m: any) => {
                    m?.metadata?.HITL_Resolutions?.forEach((resol: any) => {
                      if (resol.requestId === hitlRequest.requestId) {
                        resolution = resol;
                      }
                    });
                    m?.metadata?.appliedHITLResolutions?.forEach((appliedResolution: any) => {
                      if (appliedResolution?.request?.requestId === hitlRequest.requestId) {
                        resolution = appliedResolution?.resolution;
                      }
                    });
                  });
                });
                return resolution;
              })(),
            };
          });
          message?.metadata?.autoResolvableHITLRequests?.forEach?.((autoResolved: any) => {
            res[autoResolved.request.requestId] = {
              request: autoResolved.request,
              resolution: autoResolved.resolution,
            };
          });
        });
        return res;
      },
      {} as Record<string, THitlRequestItem>,
    ),
  );


  private readonly _autoResolutionRulesMap = signal<Record<string, THitlAutoResolutionRule>>({
    'rule-auto-notify': {
      name: 'Auto-approve Slack notifications to #finance-team',
      link: 'https://example.com/rules/rule-auto-notify',
      scope: 'ALL_USERS_OF_AGENT',
    },
    'rule-ticket-priority': {
      name: 'Escalate invoice discrepancy tickets to high priority',
      link: 'https://example.com/rules/rule-ticket-priority',
      scope: 'USER',
    },
    'rule-threshold': {
      name: 'Auto-processing threshold is $5,000 for consulting vendors',
      scope: 'ALL_USERS_OF_AGENT',
    },
    'rule-route-finance': {
      name: 'Route consulting invoices to Finance',
      link: 'https://example.com/rules/rule-route-finance',
      scope: 'USER',
    },
  });

  private readonly _autoResolutionMap = signal<Record<string, TItemState<string>>>({});

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
    hitlRequestsMap: this._hitlRequestsMap(),
    autoResolutionRulesMap: this._autoResolutionRulesMap(),
    autoResolutionMap: this._autoResolutionMap(),
  }));

  private readonly _chatkitCitation = signal<TChatkitCitation>({
    uniqueIdentifier: '_DW_REF_',
    component: CitationLink,
  });

  private readonly _chatkitFlags = signal<TChatkitFlags>({
    message: {
      timestamps: true,
    },
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
    hitl: {
      autoResolution: {},
    },
  });

  private readonly _chatkitProps = signal<TChatkitProps>({
    placeholder: 'Ask me anything...',
    selectedLLMId: LLMsResponse.find((llm) => llm.defaultLLM)?.identifier || '',
    // highlightMessageId: 'hitl-agent-pending',
  });

  userMessasgeSuggestions = signal<string[]>([
    'Hello, how are you?',
    'What is the weather like today?',
  ]);

  userMessage = signal<string>('');

  private readonly _chatkitFooter = computed<TChatkitFooter>(() => ({
    userMessage: this.userMessage(),
    sendDisabled: false,
    userFiles: ['madhu.mp3'],
    userMessageSuggestions: this.userMessasgeSuggestions(),
    userFilesMap: {
      'madhu.mp3': {
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
          file: 'madhu.mp3',
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
  }));

  readonly chatkitConfig = computed<TChatkitConfig>(() => ({
    chatkitCitation: this._chatkitCitation(),
    chatkitFlags: this._chatkitFlags(),
    chatkitProps: this._chatkitProps(),
    chatkitFooter: this._chatkitFooter(),
    // chatkitScroll: {
    //   type: 'bottom',
    //   behavior: 'smooth',
    // },
  }));

  onViewSteps({ taskId, messageId }: { taskId: string; messageId: string }) {
    console.log('onViewSteps', { taskId, messageId });
    this._stepPlanItemsOpenMap.update((prev) => {
      return { ...prev, [messageId]: !prev[messageId] };
    });
  }

  onUserMessageChange({ text }: { text: string }) {
    this.userMessage.set(text);
  }

  onSendMessage(text: string) {
    this.userMessasgeSuggestions.update((prev) => {
      return [...new Set([...prev, text].reverse())].reverse();
    });
    const parts: TMessageTextPart[] = [
      {
        kind: 'text',
        text,
      },
    ];
    this._chatkitConversation.update((prev) => {
      return {
        ...prev,
        value: [...prev.value, { taskId: 'new-task', messageIds: ['2222', '3333'] }],
      };
    });
    this._messagesMap.update((prev) => {
      return {
        ...prev,
        '2222': {
          loading: false,
          error: '',
          value: {
            role: 'USER',
            parts,
          },
        },
        '3333': {
          loading: true,
          error: '',
          value: {
            role: 'AGENT',
            parts: [],
          },
        },
      };
    });

    this.userMessage.set('');

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

  onViewProbe(data: any) {
    console.log('onviewprobe', data);
  }

  onFeedback(data: any) {
    console.log('onfeedback', data);
  }

  onHitlResolve(data: { taskId: string; messageId: string; requestId: string; resolution: any }) {
    console.log('onHitlResolve', data);
    // Update the hitlRequestsMap with the resolution to show "Provided" state
    this._hitlRequestsMap.update((prev) => {
      const item = prev[data.requestId];
      if (!item) return prev;
      return {
        ...prev,
        [data.requestId]: {
          ...item,
          resolution: data.resolution,
        },
      };
    });
  }

  onHitlCancel(data: { taskId: string; messageId: string }) {
    console.log('onHitlCancel', data);
    // Set all pending requests for this message to 'cancelled'
    const msg = this._messagesMap()[data.messageId]?.value;
    if (!msg?.hitlRequestIds?.length) return;
    this._hitlRequestsMap.update((prev) => {
      const updated = { ...prev };
      for (const requestId of msg?.hitlRequestIds || []) {
        updated[requestId] = {
          request: updated[requestId]?.request,
          resolution: 'cancelled',
        };
      }
      return updated;
    });
  }

  onHitlAutoResolution(data: THitlAutoResolutionEvent) {
    console.log('onHitlAutoResolution', data);
    if (data.type !== 'save') return;
    const requestId = data.resolution.requestId;
    this._autoResolutionMap.update((prev) => ({
      ...prev,
      [requestId]: { loading: true, error: '', value: '' },
    }));
    // Mock rule creation; a condition containing "fail" simulates an error
    setTimeout(() => {
      const failed = !!data.payload?.condition?.toLowerCase().includes('fail');
      this._autoResolutionMap.update((prev) => ({
        ...prev,
        [requestId]: failed
          ? { loading: false, error: 'Mock rule creation failed', value: '' }
          : { loading: false, error: '', value: `rule-${requestId}` },
      }));
    }, 1500);
  }
}
