import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, Input, signal } from '@angular/core';
import { ChatWindowDataService } from '../../../../../services/chat-window.data';
import {
  TStepExecution,
  TStepIteration,
  TStepPlanItem,
  TStepScenarioSelection,
  TStepToolExecution,
} from '../../../../../typings/data';
import {
  LoaderIcon,
  ChevronIcon,
  CheckCircleIcon,
  CircleIcon,
  ErrorInfoIcon,
  ToolIcon,
  ResponseIcon,
} from '../../../../icons';
import { Skeleton } from '../../../../skeleton/skeleton';

@Component({
  selector: 'dw-steps',
  imports: [
    NgTemplateOutlet,
    Skeleton,
    LoaderIcon,
    ChevronIcon,
    CheckCircleIcon,
    CircleIcon,
    ErrorInfoIcon,
    ToolIcon,
    ResponseIcon,
  ],
  templateUrl: './steps.html',
  styleUrl: './steps.scss',
})
export class Steps {
  @Input({ required: true }) messageId!: string;

  private readonly chatWindowDataService = inject(ChatWindowDataService);

  // Track expanded state for each thought
  readonly expandedThoughts = signal<Record<string, boolean>>({});

  // Track expanded state for execution accordions (default: expanded)
  readonly expandedExecutions = signal<Record<string, boolean>>({});

  readonly stepPlanItems = computed(() => {
    return this.chatWindowDataService.stepPlanItemsMap()[this.messageId]?.value ?? [];
  });

  readonly stepPlanItemsLoading = computed(() => {
    return this.chatWindowDataService.stepPlanItemsMap()[this.messageId]?.loading;
  });

  toggleThought(id: string) {
    this.expandedThoughts.update((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  isThoughtExpanded(id: string): boolean {
    return this.expandedThoughts()[id] ?? false;
  }

  toggleExecution(id: string) {
    this.expandedExecutions.update((current) => ({
      ...current,
      [id]: current[id] === undefined ? false : !current[id],
    }));
  }

  isExecutionExpanded(id: string): boolean {
    // Default to true (expanded) if not explicitly set
    return this.expandedExecutions()[id] ?? true;
  }

  hasNestedExecutions(execution: TStepExecution | TStepToolExecution): boolean {
    if ('executions' in execution && execution.executions) {
      return Object.keys(execution.executions).length > 0;
    }
    if ('children' in execution && execution.children) {
      return execution.children.length > 0;
    }
    return false;
  }

  getExecutionsArray(
    executions: Record<string, TStepToolExecution> | undefined,
  ): TStepToolExecution[] {
    if (!executions) return [];
    return Object.values(executions);
  }

  isToolExecution(item: TStepExecution | TStepToolExecution): item is TStepToolExecution {
    return 'children' in item;
  }

  asToolExecution(item: TStepExecution | TStepToolExecution): TStepToolExecution {
    return item as TStepToolExecution;
  }

  asExecution(item: TStepExecution | TStepToolExecution): TStepExecution {
    return item as TStepExecution;
  }

  isIteration(item: TStepPlanItem): item is TStepIteration {
    return item?.type === 'Iteration';
  }

  isScenarioSelection(item: TStepPlanItem): item is TStepScenarioSelection {
    return item?.type === 'Scenario Selection';
  }

  asScenarioSelection(item: TStepPlanItem): TStepScenarioSelection {
    return item as TStepScenarioSelection;
  }

  asIteration(item: TStepPlanItem): TStepIteration {
    return item as TStepIteration;
  }
}
