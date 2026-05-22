import { Component, computed, input, output } from '@angular/core';
import {
  THitlAutoResolutionEvent,
  THitlAutoResolutionRule,
  THitlRequestItem,
  THitlResolution,
} from '../../../../typings/data';
import { TItemState } from '../../../../typings/common';
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
  readonly hitlRequestIds = input.required<string[]>();
  readonly hitlRequestsMap = input.required<Record<string, THitlRequestItem>>();
  readonly isHighlighted = input<boolean>(false);
  readonly autoResolutionMap = input<Record<string, TItemState<string>>>({});
  readonly autoResolutionRulesMap = input<Record<string, THitlAutoResolutionRule>>({});
  readonly showAutoResolution = input<boolean>(false);
  readonly headerLabel = input<string>('User response required');

  readonly cancel = output<void>();
  readonly resolve = output<{
    requestId: string;
    resolution: THitlResolution;
  }>();
  readonly autoResolution = output<THitlAutoResolutionEvent>();

  readonly requestCount = computed(() => this.hitlRequestIds().length);
  readonly hasRequests = computed(() => this.requestCount() > 0);

  readonly hasPendingRequests = computed(() => {
    const hitlMap = this.hitlRequestsMap();
    return this.hitlRequestIds().some((id) => !hitlMap[id]?.resolution);
  });

  onCancel() {
    this.cancel.emit();
  }

  onResolve(event: { requestId: string; resolution: THitlResolution }) {
    this.resolve.emit(event);
  }

  onAutoResolution(event: THitlAutoResolutionEvent) {
    this.autoResolution.emit(event);
  }

  getHitlItem(requestId: string): THitlRequestItem {
    return this.hitlRequestsMap()[requestId];
  }
}
