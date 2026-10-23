import { Type } from '@angular/core';
import { TMessageFile } from './data';
import { TItemState } from './common';

export type TChatkitFlags = {
  message?: {
    timestamps?: boolean;
  }
  footer?: {
    attachment?: {
      computer?: boolean;
      dataStore?: boolean;
    };
    llmSelector?: boolean;
    textInput?: boolean;
  };
  agentMessage?: {
    steps?: boolean;
    probe?: boolean;
    feedback?: boolean;
  };
  hitl?: {
    autoResolution?: {
      blockAgentLevel?: boolean;
    }
  };
  scroll?: {
    // where the view starts when a conversation first renders (default 'bottom')
    onLoad?: 'bottom' | 'none';
    // when a new user message appears (default 'bottom'); 'anchor' puts it at the top
    // and lets the response fill in below without pulling the view down
    onSend?: 'bottom' | 'anchor' | 'none';
    // while agent content streams in (default 'follow'); follows only while at the bottom
    onResponse?: 'follow' | 'none';
    // bring the steps panel into view when it's opened (default true)
    steps?: boolean;
    // bring highlightMessageId into view and hold it there (default true)
    toHighlight?: boolean;
    // show the jump-to-bottom button (default true)
    scrollDownButton?: boolean;
    // 'smooth' animates the jump, 'auto' is instant. Following a streaming response and the
    // corrections that keep a held position in place are always instant, and every jump is
    // instant when the user prefers reduced motion
    behavior?: {
      onLoad?: ScrollBehavior; // default 'auto'
      onSend?: ScrollBehavior; // default 'smooth'
      steps?: ScrollBehavior; // default 'smooth'
      toHighlight?: ScrollBehavior; // default 'auto'
      scrollDownButton?: ScrollBehavior; // default 'smooth'
    };
  };
};

export type TChatkitProps = {
  placeholder?: string;
  allowedFileTypes?: string[];
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
};
