import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { TAdditionalFeedback, THitlResolution, TMessageFile } from '../typings/data';

@Injectable()
export class ChatWindowEventsService {
  readonly activeFeedbackId = signal<string | null>(null);
  readonly userMessageChange$ = new Subject<{ event: Event; text: string }>();
  readonly sendMessage$ = new Subject<string>();
  readonly selectLLM$ = new Subject<string>();
  readonly viewSteps$ = new Subject<{ taskId: string; messageId: string }>();
  readonly selectDataStore$ = new Subject<void>();
  readonly removeUserFile$ = new Subject<string>();
  readonly selectComputerUpload$ = new Subject<File[]>();
  readonly selectFile$ = new Subject<TMessageFile | undefined>();
  readonly feedback$ = new Subject<{
    taskId: string;
    messageId: string;
    thumbsUpOrDown?: number;
    additionalFeedback?: TAdditionalFeedback;
  }>();
  readonly viewProbe$ = new Subject<{ taskId: string; messageId: string }>();
  readonly scrollComplete$ = new Subject<void>();
  readonly hitlResolve$ = new Subject<{
    taskId: string;
    messageId: string;
    requestId: string;
    resolution: THitlResolution;
  }>();
  readonly hitlCancel$ = new Subject<{
    taskId: string;
    messageId: string;
  }>();
}
