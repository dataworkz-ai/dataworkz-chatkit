import { Component, computed, inject, input } from '@angular/core';
import { MarkdownViewer } from './markdown-viewer/markdown-viewer';
import { AiMessageFooter } from './ai-message-footer/ai-message-footer';
import { ChatWindowDataService } from '../../../services/chat-window.data';
import { Skeleton } from '../../skeleton/skeleton';
import { AgentAvatarIcon } from '../../icons';
import { AiDataItem } from './ai-data-item/ai-data-item';
import { AiFileItem } from './ai-file-item/ai-file-item';
import { HitlSection } from './hitl-section/hitl-section';

@Component({
  selector: 'dw-ai-message',
  imports: [
    MarkdownViewer,
    AiMessageFooter,
    AiFileItem,
    Skeleton,
    AgentAvatarIcon,
    AiDataItem,
    HitlSection,
  ],
  templateUrl: './ai-message.html',
  styleUrl: './ai-message.scss',
})
export class AiMessage {
  readonly taskId = input<string>('');
  readonly messageId = input<string>('');

  private readonly chatWindowDataService = inject(ChatWindowDataService);

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

  readonly showFooter = computed(() => {
    return (
      this.chatWindowDataService.chatkitFlags()?.agentMessage?.feedback !== undefined ||
      !!this.chatWindowDataService.chatkitFlags()?.agentMessage?.steps ||
      !!this.chatWindowDataService.chatkitFlags()?.agentMessage?.probe
    );
  });
  readonly hasHitlRequests = computed(() => {
    const msg = this.chatWindowDataService.messagesMap()[this.messageId()]?.value;
    return !!msg?.hitlRequestIds?.length;
  });

  readonly isHighlighted = computed(() => {
    return this.chatWindowDataService.chatkitProps().highlightMessageId === this.messageId();
  });
}
