import { Component, computed, inject, input } from '@angular/core';
import { MarkdownViewer } from './markdown-viewer/markdown-viewer';
import { AiMessageFooter } from './ai-message-footer/ai-message-footer';
import { ChatWindowDataService } from '../../../services/chat-window.data';
import { ChatWindowEventsService } from '../../../services/chat-window.events';
import { Skeleton } from '../../skeleton/skeleton';
import { AiDataItem } from './ai-data-item/ai-data-item';
import { AiFileItem } from './ai-file-item/ai-file-item';
import { HitlSection } from './hitl-section/hitl-section';
import { THitlAutoResolutionEvent, THitlResolution } from '../../../typings/data';
import { formatMessageTimestamp } from '../utils';

@Component({
  selector: 'dw-ai-message',
  imports: [MarkdownViewer, AiMessageFooter, AiFileItem, Skeleton, AiDataItem, HitlSection],
  templateUrl: './ai-message.html',
  styleUrl: './ai-message.scss',
})
export class AiMessage {
  readonly taskId = input<string>('');
  readonly messageId = input<string>('');

  private readonly chatWindowDataService = inject(ChatWindowDataService);
  private readonly chatWindowEventsService = inject(ChatWindowEventsService);

  readonly messageLoading = computed(() => {
    return this.chatWindowDataService.messagesMap()[this.messageId()]?.loading;
  });

  readonly messageError = computed(() => {
    if (this.chatWindowDataService.messagesMap()[this.messageId()]?.value?.parts?.length) {
      return '';
    }
    return this.chatWindowDataService.messagesMap()[this.messageId()]?.error;
  });

  readonly parts = computed(() => {
    return this.chatWindowDataService.messagesMap()[this.messageId()]?.value?.parts || [];
  });

  readonly timestampLabel = computed(() => {
    if (!this.chatWindowDataService.chatkitFlags()?.message?.timestamps) return '';
    if (this.messageLoading() || !this.parts().length) return '';
    return formatMessageTimestamp(
      this.chatWindowDataService.messagesMap()[this.messageId()]?.value?.timestamp,
    );
  });

  readonly showFooter = computed(() => {
    return (
      this.chatWindowDataService.chatkitFlags()?.agentMessage?.feedback !== undefined ||
      !!this.chatWindowDataService.chatkitFlags()?.agentMessage?.steps ||
      !!this.chatWindowDataService.chatkitFlags()?.agentMessage?.probe
    );
  });

  readonly hitlRequestIds = computed(() => {
    const msg = this.chatWindowDataService.messagesMap()[this.messageId()]?.value;
    return msg?.hitlRequestIds || [];
  });

  readonly hasHitlRequests = computed(() => this.hitlRequestIds().length > 0);

  readonly autoResolvedHitlRequestIds = computed(() => {
    const ids = this.hitlRequestIds();
    const map = this.hitlRequestsMap();
    return ids.filter((id) => {
      const res = map[id]?.resolution;
      return typeof res === 'object' && !!res?.sourceRuleId;
    });
  });

  readonly nonAutoResolvedHitlRequestIds = computed(() => {
    const ids = this.hitlRequestIds();
    const map = this.hitlRequestsMap();
    return ids.filter((id) => {
      const res = map[id]?.resolution;
      return !(typeof res === 'object' && !!res?.sourceRuleId);
    });
  });

  readonly hasAutoResolvedHitlRequests = computed(
    () => this.autoResolvedHitlRequestIds().length > 0,
  );
  readonly hasNonAutoResolvedHitlRequests = computed(
    () => this.nonAutoResolvedHitlRequestIds().length > 0,
  );

  readonly hitlRequestsMap = computed(() => this.chatWindowDataService.hitlRequestsMap());
  readonly autoResolutionMap = computed(() => this.chatWindowDataService.autoResolutionMap());
  readonly autoResolutionRulesMap = computed(
    () => this.chatWindowDataService.autoResolutionRulesMap(),
  );
  readonly showAutoResolution = computed(
    () => !!this.chatWindowDataService.chatkitFlags()?.hitl?.autoResolution,
  );
  readonly blockAutoResolutionAgentLevel = computed(
    () =>
      !!this.chatWindowDataService.chatkitFlags()?.hitl?.autoResolution?.blockAgentLevel,
  );

  readonly isHitlHighlighted = computed(() => {
    return (
      this.chatWindowDataService.chatkitProps().highlightMessageId === this.messageId() &&
      this.hasHitlRequests()
    );
  });

  readonly isHighlighted = computed(() => {
    return (
      this.chatWindowDataService.chatkitProps().highlightMessageId === this.messageId() &&
      this.parts().some((p) => (p.kind === 'text' && !!p.text) || p.kind !== 'text')
    );
  });

  onHitlCancel() {
    this.chatWindowEventsService.hitlCancel$.next({
      taskId: this.taskId(),
      messageId: this.messageId(),
    });
  }

  onHitlResolve(event: { requestId: string; resolution: THitlResolution }) {
    this.chatWindowEventsService.hitlResolve$.next({
      taskId: this.taskId(),
      messageId: this.messageId(),
      requestId: event.requestId,
      resolution: event.resolution,
    });
  }

  onHitlAutoResolution(event: THitlAutoResolutionEvent) {
    this.chatWindowEventsService.hitlAutoResolution$.next(event);
  }
}
