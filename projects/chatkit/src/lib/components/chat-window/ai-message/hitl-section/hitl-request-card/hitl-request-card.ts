import { Component, computed, inject, input, signal } from '@angular/core';
import { ChatWindowDataService } from '../../../../../services/chat-window.data';
import { ChatWindowEventsService } from '../../../../../services/chat-window.events';
import { CheckCircleIcon, CircleIcon } from '../../../../icons';

@Component({
  selector: 'dw-hitl-request-card',
  standalone: true,
  imports: [CheckCircleIcon, CircleIcon],
  templateUrl: './hitl-request-card.html',
  styleUrl: './hitl-request-card.scss',
})
export class HitlRequestCard {
  readonly taskId = input.required<string>();
  readonly requestId = input.required<string>();
  readonly messageId = input.required<string>();

  private readonly chatWindowDataService = inject(ChatWindowDataService);
  private readonly chatWindowEventsService = inject(ChatWindowEventsService);

  readonly hitlItem = computed(() => this.chatWindowDataService.hitlRequestsMap()[this.requestId()]);
  readonly request = computed(() => this.hitlItem()?.request);
  readonly resolution = computed(() => this.hitlItem()?.resolution);
  readonly isPending = computed(() => !this.resolution());
  readonly isProvided = computed(() => !!this.resolution());

  readonly typeLabel = computed(() => {
    switch (this.request()?.type) {
      case 'APPROVAL_REQUIRED':
      case 'APPROVAL_WITH_MODIFICATIONS':
        return 'Approval required';
      case 'INPUT_REQUIRED':
        return 'Input required';
      case 'CLARIFICATION_REQUIRED':
        return 'Clarification required';
      default:
        return 'Response required';
    }
  });

  readonly isApproval = computed(
    () =>
      this.request()?.type === 'APPROVAL_REQUIRED' ||
      this.request()?.type === 'APPROVAL_WITH_MODIFICATIONS',
  );
  readonly isInput = computed(() => this.request()?.type === 'INPUT_REQUIRED');
  readonly isClarification = computed(() => this.request()?.type === 'CLARIFICATION_REQUIRED');

  readonly contextEntries = computed(() => {
    const ctx = this.request()?.context || {};
    return Object.entries(ctx).map(([key, value]) => ({ key, value }));
  });

  readonly resolvedAnswerText = computed(() => {
    const res = this.resolution();
    if (!res) return '';
    if (res.userInput) return res.userInput;
    const option = this.request()?.options?.find((o) => o.optionId === res.selectedOption);
    return option?.label || res.selectedOption;
  });

  readonly userInput = signal('');
  readonly selectedOptionId = signal<string | null>(null);

  onApprove() {
    this.emitResolution('approve');
  }

  onReject() {
    this.emitResolution('reject');
  }

  onConfirmInput() {
    const input = this.userInput();
    if (!input.trim()) return;
    this.emitResolution('provide', input);
  }

  onConfirmClarification() {
    const selectedId = this.selectedOptionId();
    if (!selectedId) return;
    this.emitResolution(selectedId);
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onConfirmInput();
    }
  }

  private emitResolution(selectedOption: string, userInput?: string) {
    this.chatWindowEventsService.hitlResolve$.next({
      taskId: this.taskId(),
      messageId: this.messageId(),
      requestId: this.requestId(),
      resolution: {
        requestId: this.requestId(),
        selectedOption,
        userInput,
      },
    });
  }
}
