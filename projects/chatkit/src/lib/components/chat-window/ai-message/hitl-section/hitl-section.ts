import { Component, computed, inject, input } from '@angular/core';
import { ChatWindowDataService } from '../../../../services/chat-window.data';
import { ChatWindowEventsService } from '../../../../services/chat-window.events';
import { HitlRequestCard } from './hitl-request-card/hitl-request-card';
import { StopIcon } from '../../../icons/stop-icon';

@Component({
  selector: 'dw-hitl-section',
  standalone: true,
  imports: [HitlRequestCard, StopIcon],
  templateUrl: './hitl-section.html',
  styleUrl: './hitl-section.scss',
})
export class HitlSection {
  readonly taskId = input.required<string>();
  readonly messageId = input.required<string>();

  private readonly chatWindowDataService = inject(ChatWindowDataService);
  private readonly chatWindowEventsService = inject(ChatWindowEventsService);

  readonly hitlRequestIds = computed(() => {
    const msg = this.chatWindowDataService.messagesMap()[this.messageId()]?.value;
    return msg?.hitlRequestIds || [];
  });

  readonly requestCount = computed(() => this.hitlRequestIds().length);
  readonly hasRequests = computed(() => this.requestCount() > 0);

  readonly hasPendingRequests = computed(() => {
    const hitlMap = this.chatWindowDataService.hitlRequestsMap();
    return this.hitlRequestIds().some((id) => !hitlMap[id]?.resolution);
  });

  readonly isHighlighted = computed(() => {
    return (
      this.chatWindowDataService.chatkitProps().highlightMessageId === this.messageId() &&
      this.hasRequests()
    );
  });

  onCancel() {
    this.chatWindowEventsService.hitlCancel$.next({
      taskId: this.taskId(),
      messageId: this.messageId(),
    });
  }
}
