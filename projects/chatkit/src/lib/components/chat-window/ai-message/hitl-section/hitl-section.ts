import { Component, computed, inject, input } from '@angular/core';
import { ChatWindowDataService } from '../../../../services/chat-window.data';
import { HitlRequestCard } from './hitl-request-card/hitl-request-card';

@Component({
  selector: 'dw-hitl-section',
  standalone: true,
  imports: [HitlRequestCard],
  templateUrl: './hitl-section.html',
  styleUrl: './hitl-section.scss',
})
export class HitlSection {
  readonly taskId = input.required<string>();
  readonly messageId = input.required<string>();

  private readonly chatWindowDataService = inject(ChatWindowDataService);

  readonly hitlRequestIds = computed(() => {
    const msg = this.chatWindowDataService.messagesMap()[this.messageId()]?.value;
    return msg?.hitlRequestIds || [];
  });

  readonly requestCount = computed(() => this.hitlRequestIds().length);
  readonly hasRequests = computed(() => this.requestCount() > 0);

  readonly isHighlighted = computed(() => {
    return (
      this.chatWindowDataService.chatkitProps().highlightMessageId === this.messageId() &&
      this.hasRequests()
    );
  });
}
