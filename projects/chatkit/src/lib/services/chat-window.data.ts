import { computed, Injectable, signal } from '@angular/core';
import { TItemState } from '../typings/common';
import {
  TChatkitAgent,
  TChatkitConversationTask,
  TChatkitConversationTaskMessage,
  TChatkitLLMItem,
  THitlRequestItem,
  TStepPlanItem,
} from '../typings/data';
import {
  TChatkitCitation,
  TChatkitFlags,
  TChatkitFooter,
  TChatkitProps,
  TChatkitScroll,
} from '../typings/config';

@Injectable()
export class ChatWindowDataService {
  // private readonly
  private readonly _chatkitFlags = signal<TChatkitFlags>({});
  private readonly _chatkitProps = signal<TChatkitProps>({});
  private readonly _chatkitCitation = signal<TChatkitCitation>({});
  private readonly _chatkitScroll = signal<TChatkitScroll | undefined>(undefined);
  private readonly _chatkitFooter = signal<TChatkitFooter>({});
  private readonly _chatkitConversation = signal<TItemState<TChatkitConversationTask[]>>({
    loading: false,
    value: [],
    error: '',
  });
  private readonly _LLMs = signal<TItemState<TChatkitLLMItem[]>>({
    loading: false,
    value: [],
    error: '',
  });
  private readonly _chatkitAgent = signal<TItemState<TChatkitAgent>>({
    loading: false,
    value: { description: '' },
    error: '',
  });
  private readonly _messagesMap = signal<
    Record<string, TItemState<TChatkitConversationTaskMessage>>
  >({});
  private readonly _stepPlanItemsMap = signal<Record<string, TItemState<TStepPlanItem[]>>>({});
  private readonly _stepPlanItemsOpenMap = signal<Record<string, boolean>>({});
  private readonly _hitlRequestsMap = signal<Record<string, THitlRequestItem>>({});

  // readonly getters
  readonly chatkitFlags = computed<TChatkitFlags>(() => this._chatkitFlags());
  readonly chatkitProps = computed<TChatkitProps>(() => this._chatkitProps());
  readonly chatkitCitation = computed<TChatkitCitation>(() => this._chatkitCitation());
  readonly chatkitConversation = computed<TItemState<TChatkitConversationTask[]>>(() =>
    this._chatkitConversation(),
  );
  readonly LLMs = computed<TItemState<TChatkitLLMItem[]>>(() => this._LLMs());
  readonly chatkitAgent = computed<TItemState<TChatkitAgent>>(() => this._chatkitAgent());
  readonly messagesMap = computed<Record<string, TItemState<TChatkitConversationTaskMessage>>>(() =>
    this._messagesMap(),
  );
  readonly stepPlanItemsMap = computed<Record<string, TItemState<TStepPlanItem[]>>>(() =>
    this._stepPlanItemsMap(),
  );
  readonly stepPlanItemsOpenMap = computed<Record<string, boolean>>(() =>
    this._stepPlanItemsOpenMap(),
  );
  readonly hitlRequestsMap = computed<Record<string, THitlRequestItem>>(() =>
    this._hitlRequestsMap(),
  );
  readonly chatkitFooter = computed<TChatkitFooter>(() => this._chatkitFooter());
  readonly chatkitScroll = computed<TChatkitScroll | undefined>(() => this._chatkitScroll());

  // public setters
  setChatkitFlags(value: TChatkitFlags) {
    this._chatkitFlags.set(value);
  }
  setChatkitProps(value: TChatkitProps) {
    this._chatkitProps.set(value);
  }
  setChatkitCitation(value: TChatkitCitation) {
    this._chatkitCitation.set(value);
  }
  setChatkitConversation(value: TItemState<TChatkitConversationTask[]>) {
    this._chatkitConversation.set(value);
  }
  setLLMs(value: TItemState<TChatkitLLMItem[]>) {
    this._LLMs.set(value);
  }
  setChatkitAgent(value: TItemState<TChatkitAgent>) {
    this._chatkitAgent.set(value);
  }
  setMessagesMap(value: Record<string, TItemState<TChatkitConversationTaskMessage>>) {
    this._messagesMap.set(value);
  }
  setStepPlanItemsMap(value: Record<string, TItemState<TStepPlanItem[]>>) {
    this._stepPlanItemsMap.set(value);
  }
  setStepPlanItemsOpenMap(value: Record<string, boolean>) {
    this._stepPlanItemsOpenMap.set(value);
  }
  setHitlRequestsMap(value: Record<string, THitlRequestItem>) {
    this._hitlRequestsMap.set(value);
  }
  setChatkitFooter(value: TChatkitFooter) {
    this._chatkitFooter.set(value);
  }
  setChatkitScroll(value: TChatkitScroll | undefined) {
    this._chatkitScroll.set(value);
  }
}
