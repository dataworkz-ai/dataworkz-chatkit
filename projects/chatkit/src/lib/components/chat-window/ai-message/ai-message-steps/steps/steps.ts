import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { ChatWindowDataService } from '../../../../../services/chat-window.data';
import { CheckIcon, ChevronIcon, ErrorInfoIcon } from '../../../../icons';
import { Skeleton } from '../../../../skeleton/skeleton';
import { buildStepNodes, TStepNode } from './utils';

@Component({
  selector: 'dw-steps',
  imports: [NgTemplateOutlet, Skeleton, CheckIcon, ChevronIcon, ErrorInfoIcon],
  templateUrl: './steps.html',
  styleUrl: './steps.scss',
})
export class Steps {
  readonly messageId = input.required<string>();

  private readonly chatWindowDataService = inject(ChatWindowDataService);

  // Thoughts are collapsed by default
  readonly expandedThoughts = signal<Record<string, boolean>>({});

  // Rows with progress list only their in-progress items until "Items" is opened
  readonly expandedItems = signal<Record<string, boolean>>({});

  readonly stepPlanItemsLoading = computed(() => {
    return this.chatWindowDataService.stepPlanItemsMap()[this.messageId()]?.loading;
  });

  readonly nodes = computed(() =>
    buildStepNodes(this.chatWindowDataService.stepPlanItemsMap()[this.messageId()]?.value ?? []),
  );

  toggleThought(id: string) {
    this.expandedThoughts.update((current) => ({ ...current, [id]: !current[id] }));
  }

  toggleItems(id: string) {
    this.expandedItems.update((current) => ({ ...current, [id]: !current[id] }));
  }

  isThoughtExpanded(id: string): boolean {
    return !!this.expandedThoughts()[id];
  }

  isItemsExpanded(id: string): boolean {
    return !!this.expandedItems()[id];
  }

  hasItemsToggle(node: TStepNode): boolean {
    return !!node.progress && node.children.length > 0;
  }

  visibleChildren(node: TStepNode): TStepNode[] {
    if (!this.hasItemsToggle(node) || this.isItemsExpanded(node.id)) return node.children;
    return node.children.filter((child) => child.status === 'in_progress');
  }
}
