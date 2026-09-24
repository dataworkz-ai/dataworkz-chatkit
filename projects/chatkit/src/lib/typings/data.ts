import { TItemState } from './common';

export type TStepStatus = 'in_progress' | 'completed' | 'not_started' | 'failed' | 'pending';

export type TStepBase = {
  type: string;
  name: string;
  metadata: Record<string, any>;
  status: TStepStatus;
};

export type TStepScenarioSelection = TStepBase & {
  type: 'Scenario Selection';
  llmThought: string;
  statusMessage?: string;
};

export type TStepPlanning = TStepBase & {
  type: 'Planning';
  llmThought: string;
};

export type TStepToolExecution = TStepBase & {
  executionId: string;
  toolId: string;
  toolType: string;
  type: 'Tool Execution';
  children?: TStepPlanItem[];
  statusMessage?: string;
};

export type TStepToolStatus = TStepBase & {
  body: string;
  key?: string;
  name?: string;
  severity?: 'info' | 'warn' | 'error';
  title?: string;
  ts: number;
  type: 'Status';
  progress?: { current: number; total: string };
};

export type TStepExecution = TStepBase & {
  type: 'Tool Execution';
  executionId: string;
  toolId: string;
  toolType: string;
  executions?: Record<string, TStepToolExecution | TStepToolStatus>;
  statusMessage?: string;
};

export type TStepAgentResponse = TStepBase & {
  type: 'Join';
  llmThought: string;
};

export type TStepIteration = TStepBase & {
  type: 'Iteration';
  planning?: TStepPlanning;
  executions?: TStepExecution[];
  agentResponse?: TStepAgentResponse;
};

export type TStepPlanItem = TStepScenarioSelection | TStepIteration;

export type TMessageTextPart = {
  kind: 'text';
  text: string;
  metadata?: any;
};

export type TMessageDataPart = {
  kind: 'data';
  data: {
    description?: string;
    files?: TMessageFile[];
    [key: string]: any;
  };
  metadata?: any;
};

export type IMessageFilePart = {
  kind: 'file';
  file: {
    url?: string;
    uri?: string;
    bytes?: string;
    mimeType?: string;
    fileName?: string;
    name?: string;
  };
  metadata?: any;
};

export type TAdditionalFeedback = {
  feedbackText?: string;
  thisIsntTrue?: boolean;
  thisIsntHelpful?: boolean;
};

export type TChatkitConversationTaskMessage = {
  role: 'AGENT' | 'USER';
  parts: (TMessageTextPart | TMessageDataPart | IMessageFilePart)[];
  thumbsUpOrDown?: number;
  additionalFeedback?: TAdditionalFeedback;
  hitlRequestIds?: string[];
};

export type TChatkitLLMItem = {
  label: string;
  value: string;
};

export type TChatkitAgent = {
  description: string;
};

export type TMessageFile = {
  documentId?: string;
  file?: string;
  filePath?: string;
  ingestUuid?: string;
  ingestName?: string;
};

export type TChatkitConversationTask = {
  taskId: string;
  messageIds: string[];
};

// HITL Types
export type THitlRequestType =
  | 'APPROVAL_REQUIRED'
  | 'APPROVAL_WITH_MODIFICATIONS'
  | 'INPUT_REQUIRED'
  | 'CLARIFICATION_REQUIRED';

export type THitlOption = {
  optionId: string;
  label: string;
  metadata: Record<string, any>;
};

export type THitlRequest = {
  autoResolvable?: boolean;
  requestId: string;
  type: THitlRequestType;
  toolId: string | null;
  toolName: string | null;
  question: string;
  context?: {
    contextData?: string | Record<string, any>;
    args?: Record<string, any>;
  };
  options: THitlOption[];
  createdAt: string;
};

export type THitlResolution = {
  requestId: string;
  selectedOption: string;
  modifiedArgs?: Record<string, any>;
  userInput?: string;
  resolvedAt?: string;
  sourceRuleId?: string;
  resolutionThought?: string;
};

export type THitlRequestItem = {
  request: THitlRequest;
  resolution?: THitlResolution | 'cancelled';
};

export type THitlAutoResolutionScope = 'ALL_USERS_OF_AGENT' | 'USER';

export type THitlAutoResolutionEvent = {
  request: THitlRequest;
  resolution: THitlResolution;
  type: 'save' | 'viewRule';
  payload?: {
    condition?: string;
    ruleId?: string;
    skipValidation?: boolean;
    scope?: THitlAutoResolutionScope;
  };
};

export type THitlAutoResolutionRule = {
  name: string;
  link?: string;
  scope?: THitlAutoResolutionScope;
};

export type TChatkitData = {
  chatkitConversation?: TItemState<TChatkitConversationTask[]>;
  messagesMap?: Record<string, TItemState<TChatkitConversationTaskMessage>>;
  stepPlanItemsMap?: Record<string, TItemState<TStepPlanItem[]>>;
  stepPlanItemsOpenMap?: Record<string, boolean>;
  hitlRequestsMap?: Record<string, THitlRequestItem>;
  autoResolutionMap?: Record<string, TItemState<string>>;
  autoResolutionRulesMap?: Record<string, THitlAutoResolutionRule>;
  LLMs?: TItemState<TChatkitLLMItem[]>;
  chatkitAgent?: TItemState<TChatkitAgent>;
};
