import { Type } from '@angular/core';
import { TMessageFile } from './data';
import { TItemState } from './common';

export type TChatkitFlags = {
  footer?: {
    attachment?: {
      computer?: boolean;
      dataStore?: boolean;
    };
    llmSelector?: boolean;
  };
  agentMessage?: {
    steps?: boolean;
    probe?: boolean;
    feedback?: boolean;
  };
};

export type TChatkitScroll = {
  type: 'bottom' | 'messageId' | 'steps';
  messageId?: string;
  behavior?: ScrollBehavior;
};

export type TChatkitProps = {
  placeholder?: string;
  allowedFileTypes?: string[];
  userInitials?: string;
  selectedLLMId?: string;
  highlightMessageId?: string;
};

export type TUserFile = {
  uploadStatus?: TItemState<string>;
  ingestStatus?: TItemState<string>;
  documentStatus?: TItemState<string>;
  metadata?: {
    size?: number;
  };
  messageFile?: TMessageFile;
};

export type TChatkitFooter = {
  userMessage?: string;
  sendDisabled?: boolean;
  userFiles?: string[];
  userFilesMap?: Record<string, TUserFile>;
  userMessageSuggestions?: string[];
};

export type TChatkitCitation = {
  component?: Type<any>;
  uniqueIdentifier?: string;
};

export type TChatkitConfig = {
  chatkitFlags?: TChatkitFlags;
  chatkitProps?: TChatkitProps;
  chatkitCitation?: TChatkitCitation;
  chatkitFooter?: TChatkitFooter;
  chatkitScroll?: TChatkitScroll;
};
