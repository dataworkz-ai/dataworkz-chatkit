import { Component, computed, input, output, signal } from '@angular/core';
import {
  THitlAutoResolutionEvent,
  THitlAutoResolutionRule,
  THitlRequestItem,
  THitlResolution,
} from '../../../../typings/data';
import { TItemState } from '../../../../typings/common';
import { ArrowRightIcon, BoltIcon, ChevronIcon } from '../../../icons';
import { HitlRequestCard } from '../hitl-section/hitl-request-card/hitl-request-card';

/** One auto-resolved HITL request, collapsed to a single line; expands to the full request card. */
@Component({
  selector: 'dw-auto-resolved-hitl',
  standalone: true,
  imports: [HitlRequestCard, BoltIcon, ChevronIcon, ArrowRightIcon],
  templateUrl: './auto-resolved-hitl.html',
  styleUrl: './auto-resolved-hitl.scss',
})
export class AutoResolvedHitl {
  readonly requestId = input.required<string>();
  readonly hitlItem = input.required<THitlRequestItem>();
  readonly autoResolutionMap = input<Record<string, TItemState<string>>>({});
  readonly autoResolutionRulesMap = input<Record<string, THitlAutoResolutionRule>>({});
  readonly showAutoResolution = input<boolean>(false);
  readonly blockAutoResolutionAgentLevel = input<boolean>(false);

  readonly resolve = output<{ requestId: string; resolution: THitlResolution }>();
  readonly autoResolution = output<THitlAutoResolutionEvent>();

  readonly expanded = signal(false);

  readonly request = computed(() => this.hitlItem()?.request);
  readonly resolution = computed(() => {
    const res = this.hitlItem()?.resolution;
    return typeof res === 'object' ? res : undefined;
  });

  readonly label = computed(() => {
    const type = this.request()?.type;
    return type === 'APPROVAL_REQUIRED' || type === 'APPROVAL_WITH_MODIFICATIONS'
      ? 'Auto-approved'
      : 'Auto-resolved';
  });

  // The question on one line; markdown markers would read as noise here.
  readonly questionText = computed(() =>
    (this.request()?.question ?? '')
      .replace(/[*_`#>]+/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  );

  private readonly rule = computed(() => {
    const ruleId = this.resolution()?.sourceRuleId;
    return ruleId ? this.autoResolutionRulesMap()[ruleId] : undefined;
  });
  readonly ruleName = computed(() => this.rule()?.name || null);
  readonly ruleLink = computed(() => this.rule()?.link || null);

  toggle() {
    this.expanded.update((open) => !open);
  }

  onViewChoice() {
    const request = this.request();
    const resolution = this.resolution();
    if (!request || !resolution) return;
    this.autoResolution.emit({
      request,
      resolution,
      type: 'viewRule',
      payload: { ruleId: resolution.sourceRuleId },
    });
  }
}
