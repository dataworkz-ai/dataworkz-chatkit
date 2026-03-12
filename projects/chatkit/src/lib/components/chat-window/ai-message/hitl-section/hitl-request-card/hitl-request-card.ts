import {
  afterEveryRender,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
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
  private readonly elementRef = inject(ElementRef);

  constructor() {
    afterEveryRender(() => {
      const el = this.elementRef.nativeElement as HTMLElement;
      const unsized = el.querySelectorAll<HTMLTextAreaElement>('textarea:not([data-auto-sized])');
      if (unsized.length === 0) return;
      // Defer to allow browser layout to complete (textareas need their final width)
      setTimeout(() => {
        unsized.forEach((ta) => {
          if (ta.offsetWidth > 50) {
            this.resizeTextarea(ta);
            ta.dataset['autoSized'] = '1';
          }
        });
      });
    });
  }

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

  readonly typeSubLabel = computed(() => {
    switch (this.request()?.type) {
      case 'APPROVAL_WITH_MODIFICATIONS':
        return 'Modify values and approve as needed.';
      default:
        return '';
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

  // Context section: contextData only (string or Record<string, any>)
  readonly contextData = computed(() => this.request()?.context?.contextData);
  readonly contextDataIsString = computed(() => typeof this.contextData() === 'string');

  readonly contextDataEntries = computed(() => {
    const data = this.contextData();
    if (!data || typeof data !== 'object') return [];
    return Object.entries(data).map(([key, value]) => ({
      key,
      isObject: typeof value === 'object' && value !== null,
      displayValue:
        typeof value === 'object' && value !== null
          ? JSON.stringify(value, null, 2)
          : String(value),
    }));
  });

  readonly hasContextSection = computed(() => !!this.contextData());

  // Args — available for all types, editable only for APPROVAL_WITH_MODIFICATIONS
  readonly originalArgs = computed(() => {
    return (this.request()?.context?.['args'] as Record<string, any>) || {};
  });

  readonly hasArgsSection = computed(() => Object.keys(this.originalArgs()).length > 0);

  readonly readonlyArgsEntries = computed(() => {
    const args = this.originalArgs();
    return Object.entries(args).map(([key, value]) => ({
      key,
      isObject: typeof value === 'object' && value !== null,
      displayValue:
        typeof value === 'object' && value !== null
          ? JSON.stringify(value, null, 2)
          : String(value),
    }));
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

  // Separated options: fixed options vs clarify option
  readonly fixedOptions = computed(
    () => this.request()?.options?.filter((o) => o.optionId !== 'clarify') ?? [],
  );
  readonly clarifyOption = computed(
    () => this.request()?.options?.find((o) => o.optionId === 'clarify') ?? null,
  );

  // Search for fixed options
  readonly optionSearchQuery = signal('');
  readonly showOptionSearch = computed(() => this.fixedOptions().length > 8);
  readonly filteredFixedOptions = computed(() => {
    const query = this.optionSearchQuery().toLowerCase().trim();
    if (!query) return this.fixedOptions();
    return this.fixedOptions().filter((o) => o.label.toLowerCase().includes(query));
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

  autoResizeTextarea(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    this.resizeTextarea(el);
  }

  private resizeTextarea(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    const cs = getComputedStyle(el);
    let lineHeight = parseFloat(cs.lineHeight);
    if (isNaN(lineHeight)) {
      lineHeight = parseFloat(cs.fontSize) * 1.4;
    }
    const paddingY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const minHeight = Math.ceil(lineHeight + paddingY);
    const maxHeight = Math.ceil(lineHeight * 4 + paddingY);

    // Clamp manual resize range to 1–4 rows
    el.style.minHeight = minHeight + 'px';
    el.style.maxHeight = maxHeight + 'px';

    if (el.scrollHeight > maxHeight) {
      el.style.height = maxHeight + 'px';
      el.style.overflowY = 'auto';
    } else {
      el.style.height = el.scrollHeight + 'px';
      el.style.overflowY = 'hidden';
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
