import { Component, computed, inject, input, signal } from '@angular/core';
import { ChatWindowDataService } from '../../../../../services/chat-window.data';
import { ChatWindowEventsService } from '../../../../../services/chat-window.events';
import { CheckIcon } from '../../../../icons';

@Component({
  selector: 'dw-hitl-request-card',
  standalone: true,
  imports: [CheckIcon],
  templateUrl: './hitl-request-card.html',
  styleUrl: './hitl-request-card.scss',
})
export class HitlRequestCard {
  readonly taskId = input.required<string>();
  readonly requestId = input.required<string>();
  readonly messageId = input.required<string>();

  private readonly chatWindowDataService = inject(ChatWindowDataService);
  private readonly chatWindowEventsService = inject(ChatWindowEventsService);

  readonly hitlItem = computed(
    () => this.chatWindowDataService.hitlRequestsMap()[this.requestId()],
  );
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
  readonly isApprovalWithMods = computed(
    () => this.request()?.type === 'APPROVAL_WITH_MODIFICATIONS',
  );
  readonly isInput = computed(() => this.request()?.type === 'INPUT_REQUIRED');
  readonly isClarification = computed(() => this.request()?.type === 'CLARIFICATION_REQUIRED');

  // Context entries — excludes 'args' key for APPROVAL_WITH_MODIFICATIONS
  readonly contextDisplayEntries = computed(() => {
    const ctx = this.request()?.context || {};
    return Object.entries(ctx)
      .filter(([key]) => !(this.isApprovalWithMods() && key === 'args'))
      .map(([key, value]) => ({
        key,
        isObject: typeof value === 'object' && value !== null,
        displayValue:
          typeof value === 'object' && value !== null
            ? JSON.stringify(value, null, 2)
            : String(value),
      }));
  });

  // Args editing for APPROVAL_WITH_MODIFICATIONS
  readonly originalArgs = computed(() => {
    const req = this.request();
    if (req?.type === 'APPROVAL_WITH_MODIFICATIONS') {
      return (req.context?.['args'] as Record<string, any>) || {};
    }
    return {};
  });

  // Track which original arg keys are object types (need JSON editing)
  readonly originalArgIsObject = computed(() => {
    const args = this.originalArgs();
    const map: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(args)) {
      map[key] = typeof value === 'object' && value !== null;
    }
    return map;
  });

  readonly editedArgs = signal<Record<string, any> | null>(null);
  readonly currentArgs = computed(() => this.editedArgs() ?? this.originalArgs());

  // Serialize values for display in textboxes — objects become JSON strings
  readonly argsEntries = computed(() =>
    Object.entries(this.currentArgs()).map(([key, value]) => ({
      key,
      value:
        typeof value === 'object' && value !== null
          ? JSON.stringify(value, null, 2)
          : String(value),
    })),
  );

  // For provided state: show all original args with modifiedArgs overrides, as disabled inputs
  readonly providedArgsEntries = computed(() => {
    const original = this.originalArgs();
    const res = this.resolution();
    const modified = res?.modifiedArgs || {};
    // Merge: start with originals, override with modified values
    const merged = { ...original, ...modified };
    return Object.entries(merged).map(([key, value]) => {
      const isModified = key in modified;
      const origValue = original[key];
      const origStr =
        typeof origValue === 'object' && origValue !== null
          ? JSON.stringify(origValue, null, 2)
          : String(origValue ?? '');
      return {
        key,
        value:
          typeof value === 'object' && value !== null
            ? JSON.stringify(value, null, 2)
            : String(value),
        isModified,
        tooltip: isModified ? `Original: ${origStr}` : '',
      };
    });
  });

  readonly resolvedAnswerText = computed(() => {
    const res = this.resolution();
    if (!res) return '';
    if (res.userInput) return res.userInput;
    const option = this.request()?.options?.find((o) => o.optionId === res.selectedOption);
    return option?.label || res.selectedOption;
  });

  // Signals for user interaction
  readonly userInput = signal('');
  readonly selectedOptionId = signal<string | null>(null);
  readonly clarifyInput = signal('');

  // Clarification free text support
  readonly hasClarifyOption = computed(
    () => !!this.request()?.options?.some((o) => o.optionId === 'clarify'),
  );
  readonly isClarifySelected = computed(() => this.selectedOptionId() === 'clarify');
  readonly isClarificationValid = computed(() => {
    const id = this.selectedOptionId();
    if (!id) return false;
    if (id === 'clarify') return this.clarifyInput().trim().length > 0;
    return true;
  });

  onApprove() {
    if (this.isApprovalWithMods()) {
      const original = this.originalArgs();
      const current = this.currentArgs();
      const isObjectMap = this.originalArgIsObject();

      // Build modifiedArgs with only changed keys
      const modifiedArgs: Record<string, any> = {};
      for (const [key, value] of Object.entries(current)) {
        const origValue = original[key];
        const origStr =
          typeof origValue === 'object' && origValue !== null
            ? JSON.stringify(origValue, null, 2)
            : String(origValue);
        const curStr = String(value);

        if (curStr !== origStr) {
          // For object-type args, try to parse back to object; fallback to string
          if (isObjectMap[key]) {
            try {
              modifiedArgs[key] = JSON.parse(curStr);
            } catch {
              modifiedArgs[key] = curStr;
            }
          } else {
            modifiedArgs[key] = curStr;
          }
        }
      }

      // Only send modifiedArgs if there are actual changes
      this.emitResolution(
        'approve',
        undefined,
        Object.keys(modifiedArgs).length > 0 ? modifiedArgs : undefined,
      );
    } else {
      this.emitResolution('approve');
    }
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
    if (selectedId === 'clarify') {
      const text = this.clarifyInput();
      if (!text.trim()) return;
      this.emitResolution(selectedId, text);
    } else {
      this.emitResolution(selectedId);
    }
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onConfirmInput();
    }
  }

  onArgChange(key: string, value: string) {
    const current = this.editedArgs() ?? { ...this.originalArgs() };
    this.editedArgs.set({ ...current, [key]: value });
  }

  onOptionSelect(optionId: string) {
    this.selectedOptionId.set(optionId);
    if (optionId !== 'clarify') {
      this.clarifyInput.set('');
    }
  }

  onClarifyInputChange(value: string) {
    this.clarifyInput.set(value);
    this.selectedOptionId.set('clarify');
  }

  private emitResolution(
    selectedOption: string,
    userInput?: string,
    modifiedArgs?: Record<string, any>,
  ) {
    this.chatWindowEventsService.hitlResolve$.next({
      taskId: this.taskId(),
      messageId: this.messageId(),
      requestId: this.requestId(),
      resolution: {
        requestId: this.requestId(),
        selectedOption,
        userInput,
        modifiedArgs,
      },
    });
  }
}
