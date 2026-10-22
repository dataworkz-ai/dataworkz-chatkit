import {
  TStepExecution,
  TStepPlanItem,
  TStepStatus,
  TStepToolExecution,
  TStepToolStatus,
} from '../../../../../typings/data';

export type TStepProgress = { current: number; total: number; percent: number };

export type TStepStatusLine = {
  key: string;
  title?: string;
  body?: string;
};

/**
 * One row of the steps tree. Iterations become `group` nodes (a label without a status icon);
 * scenario selection, planning, tool executions and the response become `step` nodes.
 */
export type TStepNode = {
  id: string;
  kind: 'group' | 'step';
  title: string;
  status: TStepStatus;
  toolType?: string;
  thought?: string;
  progress?: TStepProgress;
  statusLines: TStepStatusLine[];
  children: TStepNode[];
};

function toProgress(progress?: { current?: number; total?: string }): TStepProgress | undefined {
  if (progress?.current == null || progress.total == null) return undefined;
  const total = parseFloat(progress.total);
  if (isNaN(total) || total <= 0) return undefined;
  return {
    current: progress.current,
    total,
    percent: Math.min((progress.current / total) * 100, 100),
  };
}

function executionNode(execution: TStepExecution | TStepToolExecution, id: string): TStepNode {
  const node: TStepNode = {
    id: execution.executionId || id,
    kind: 'step',
    title: execution.statusMessage || `Executing Tool: ${execution.name}`,
    status: execution.status,
    toolType: execution.toolType,
    statusLines: [],
    children: [],
  };

  if ('children' in execution) {
    node.children = buildStepNodes(execution.children ?? [], `${node.id}-`);
    return node;
  }

  const entries = Object.values((execution as TStepExecution).executions ?? {});
  const statuses = entries.filter((e): e is TStepToolStatus => e.type === 'Status');
  const childExecutions = entries.filter(
    (e): e is TStepToolExecution => e.type === 'Tool Execution',
  );

  // The latest status that reports progress drives the row's progress bar.
  for (let i = statuses.length - 1; i >= 0 && !node.progress; i--) {
    node.progress = toProgress(statuses[i].progress);
  }
  node.statusLines = statuses
    .filter((s) => !!s.title || !!s.body)
    .map((s, i) => ({ key: `${s.ts}-${i}`, title: s.title, body: s.body }));
  node.children = childExecutions.map((child, i) => executionNode(child, `${node.id}-${i}`));
  return node;
}

/** Normalizes step plan items into a tree of rows, keeping the original order. */
export function buildStepNodes(items: TStepPlanItem[], idPrefix = ''): TStepNode[] {
  return (items ?? []).filter(Boolean).map((item, index) => {
    const id = `${idPrefix}${index}`;

    if (item.type === 'Scenario Selection') {
      return {
        id: `scenario-${id}`,
        kind: 'step',
        title: `${item.statusMessage || 'Scenario Selected:'} ${item.name}`,
        status: item.status,
        thought: item.llmThought || undefined,
        statusLines: [],
        children: [],
      };
    }

    const children: TStepNode[] = [];
    if (item.planning) {
      children.push({
        id: `planning-${id}`,
        kind: 'step',
        title: `Planning: ${item.planning.name}`,
        status: item.planning.status,
        thought: item.planning.llmThought || undefined,
        statusLines: [],
        children: [],
      });
    }
    (item.executions ?? []).forEach((execution, i) =>
      children.push(executionNode(execution, `execution-${id}-${i}`)),
    );
    if (item.agentResponse) {
      children.push({
        id: `response-${id}`,
        kind: 'step',
        title: 'Response',
        status: item.agentResponse.status,
        thought: item.agentResponse.llmThought || undefined,
        statusLines: [],
        children: [],
      });
    }

    return {
      id: `iteration-${id}`,
      kind: 'group',
      title: item.name,
      status: item.status,
      statusLines: [],
      children,
    };
  });
}

/** Depth-first, in display order. */
export function flattenStepNodes(nodes: TStepNode[]): TStepNode[] {
  return nodes.flatMap((node) => [node, ...flattenStepNodes(node.children)]);
}

/**
 * The last in-progress step in display order, with the progress of the nearest node on its path
 * that reports one (a tool running inside a loop shows the loop's progress).
 * Group nodes (iterations) are labels, so their status is ignored.
 */
export function findActiveStep(
  nodes: TStepNode[],
  inherited?: TStepProgress,
): { node: TStepNode; progress?: TStepProgress } | undefined {
  let active: { node: TStepNode; progress?: TStepProgress } | undefined;
  for (const node of nodes) {
    const progress = node.progress ?? inherited;
    if (node.kind === 'step' && node.status === 'in_progress') active = { node, progress };
    active = findActiveStep(node.children, progress) ?? active;
  }
  return active;
}
