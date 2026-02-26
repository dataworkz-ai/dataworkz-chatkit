import { TItemState } from './common';

export type TStepStatus = 'in_progress' | 'completed' | 'not_started' | 'failed';

export type TStepBase = {
  type: string;
  name: string;
  metadata: Record<string, any>;
  status: TStepStatus;
};

export type TStepScenarioSelection = TStepBase & {
  type: 'Scenario Selection';
  llmThought: string;
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
};

export type TStepExecution = TStepBase & {
  type: 'Tool Execution';
  executionId: string;
  toolId: string;
  toolType: string;
  executions?: Record<string, TStepToolExecution>;
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
};

export type TChatkitConversationTask = string[];

export type TChatkitData = {
  chatkitConversation?: TItemState<TChatkitConversationTask[]>;
  messagesMap?: Record<string, TItemState<TChatkitConversationTaskMessage>>;
  stepPlanItemsMap?: Record<string, TItemState<TStepPlanItem[]>>;
  stepPlanItemsOpenMap?: Record<string, boolean>;
  LLMs?: TItemState<TChatkitLLMItem[]>;
  chatkitAgent?: TItemState<TChatkitAgent>;
};
