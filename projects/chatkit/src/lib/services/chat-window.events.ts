import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { IMessageFilePart, TAdditionalFeedback, TMessageFile } from '../typings/data';

@Injectable()
export class ChatWindowEventsService {
  readonly activeFeedbackId = signal<string | null>(null);
  readonly userMessageChange$ = new Subject<{ event: Event; text: string }>();
  readonly sendMessage$ = new Subject<string>();
  readonly selectLLM$ = new Subject<string>();
  readonly viewSteps$ = new Subject<string>();
  readonly selectDataStore$ = new Subject<void>();
  readonly removeUserFile$ = new Subject<string>();
  readonly selectComputerUpload$ = new Subject<File[]>();
  readonly selectAiFile$ = new Subject<IMessageFilePart>();
  readonly selectFile$ = new Subject<TMessageFile | undefined>();
  readonly feedback$ = new Subject<{
    messageId: string;
    thumbsUpOrDown?: number;
    additionalFeedback?: TAdditionalFeedback;
  }>();
  readonly viewProbe$ = new Subject<string>();
}
