import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { ChatWindowDataService } from '../../../../services/chat-window.data';
import { ChatWindowEventsService } from '../../../../services/chat-window.events';
import { ChevronIcon, ExternalLinkIcon, ListCheckIcon } from '../../../icons';
import { Steps } from './steps/steps';
import { buildStepNodes, findActiveStep, flattenStepNodes, TStepProgress } from './steps/utils';

type TStepsLineState = {
  kind: 'working' | 'completed';
  text: string;
  progress?: TStepProgress;
};

@Component({
  selector: 'dw-ai-message-steps',
  imports: [Steps, ChevronIcon, ExternalLinkIcon, ListCheckIcon],
  templateUrl: './ai-message-steps.html',
  styleUrl: './ai-message-steps.scss',
})
export class AiMessageSteps {
  readonly taskId = input.required<string>();
  readonly messageId = input.required<string>();

  private readonly chatWindowDataService = inject(ChatWindowDataService);
  private readonly chatWindowEventsService = inject(ChatWindowEventsService);

  private readonly message = computed(
    () => this.chatWindowDataService.messagesMap()[this.messageId()],
  );

  readonly messagePresent = computed(() => !!this.message()?.value?.parts?.length);
  readonly messageLoading = computed(() => !!this.message()?.loading);

  readonly showSteps = computed(
    () => !!this.chatWindowDataService.chatkitFlags()?.agentMessage?.steps,
  );

  readonly showProbe = computed(
    () => !!this.chatWindowDataService.chatkitFlags()?.agentMessage?.probe && this.messagePresent(),
  );

  private readonly stepNodes = computed(() =>
    buildStepNodes(this.chatWindowDataService.stepPlanItemsMap()[this.messageId()]?.value ?? []),
  );

  readonly lineState = computed<TStepsLineState>(() => {
    const nodes = this.stepNodes();
    const active = findActiveStep(nodes);
    if (active) return { kind: 'working', text: active.node.title, progress: active.progress };
    if (this.messageLoading()) return { kind: 'working', text: 'Thinking' };

    const count = flattenStepNodes(nodes).filter((node) => node.kind === 'step').length;
    const suffix = count ? ` · ${count} ${count === 1 ? 'step' : 'steps'}` : '';
    return { kind: 'completed', text: `Completed${suffix}` };
  });

  // While the message is streaming the host doesn't track the open state, so it's kept here.
  private readonly localOpen = signal(false);

  readonly expanded = computed(() => {
    if (!this.messagePresent()) return this.localOpen();
    return !!this.chatWindowDataService.stepPlanItemsOpenMap()[this.messageId()];
  });

  constructor() {
    // Keep the steps open if they were opened while the message was streaming.
    let wasPresent = false;
    effect(() => {
      const present = this.messagePresent();
      if (present && !wasPresent) {
        untracked(() => {
          const hostOpen = !!this.chatWindowDataService.stepPlanItemsOpenMap()[this.messageId()];
          if (this.localOpen() && !hostOpen) this.emitViewSteps();
        });
      }
      wasPresent = present;
    });
  }

  toggle() {
    if (!this.messagePresent()) {
      this.localOpen.update((open) => !open);
      return;
    }
    this.emitViewSteps();
  }

  onViewProbe() {
    this.chatWindowEventsService.viewProbe$.next({
      taskId: this.taskId(),
      messageId: this.messageId(),
    });
  }

  private emitViewSteps() {
    this.chatWindowEventsService.viewSteps$.next({
      taskId: this.taskId(),
      messageId: this.messageId(),
    });
  }
}
