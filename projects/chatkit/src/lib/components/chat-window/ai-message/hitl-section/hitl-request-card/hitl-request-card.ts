import {
  afterEveryRender,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  THitlAutoResolutionEvent,
  THitlAutoResolutionRule,
  THitlAutoResolutionScope,
  THitlRequestItem,
  THitlResolution,
} from '../../../../../typings/data';
import { TItemState } from '../../../../../typings/common';
import {
  CheckIcon,
  BoltIcon,
  UserIcon,
  UsersIcon,
  CloseIcon,
  ArrowRightIcon,
  LoaderIcon,
  ChevronIcon,
} from '../../../../icons';
import { SendArrowIcon } from '../../../../icons/search-icon';
import { Dropdown } from '../../../../dropdown/dropdown';
import { MarkdownViewer } from '../../markdown-viewer/markdown-viewer';
import { NgTemplateOutlet } from '@angular/common';
import { Popover } from '../../../../popover/popover';

type TAutoResolutionConfig = {
  condition?: string;
  skipValidation?: boolean;
  scope: THitlAutoResolutionScope;
};

@Component({
  selector: 'dw-hitl-request-card',
  standalone: true,
  imports: [
    CheckIcon,
    SendArrowIcon,
    BoltIcon,
    UserIcon,
    UsersIcon,
    CloseIcon,
    ArrowRightIcon,
    LoaderIcon,
    ChevronIcon,
    Dropdown,
    MarkdownViewer,
    Popover,
    NgTemplateOutlet,
  ],
  templateUrl: './hitl-request-card.html',
  styleUrl: './hitl-request-card.scss',
})
export class HitlRequestCard {
  readonly requestId = input.required<string>();
  readonly hitlItem = input.required<THitlRequestItem>();

  readonly autoResolutionMap = input<Record<string, TItemState<string>>>({});
  readonly autoResolutionRulesMap = input<Record<string, THitlAutoResolutionRule>>({});
  readonly showAutoResolution = input<boolean>(false);
  readonly blockAutoResolutionAgentLevel = input<boolean>(false);

  readonly resolve = output<{
    requestId: string;
    resolution: THitlResolution;
  }>();
  readonly autoResolution = output<THitlAutoResolutionEvent>();

  private readonly elementRef = inject(ElementRef);

  constructor() {
    afterEveryRender(() => {
      const el = this.elementRef.nativeElement as HTMLElement;
      const unsized = el.querySelectorAll<HTMLTextAreaElement>('textarea:not([data-auto-sized])');
      if (unsized.length === 0) return;
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

  readonly request = computed(() => this.hitlItem()?.request);
  readonly resolution = computed(() => this.hitlItem()?.resolution);
  readonly isCancelled = computed(() => this.resolution() === 'cancelled');
  readonly isPending = computed(() => !this.resolution());
  readonly isProvided = computed(() => {
    const res = this.resolution();
    return !!res && res !== 'cancelled';
  });
  readonly resolvedResolution = computed(() => {
    const res = this.resolution();
    return typeof res === 'object' ? res : undefined;
  });
  readonly canCreateAutoResolutionRule = computed(
    () => this.showAutoResolution() && this.request()?.autoResolvable !== false,
  );

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

  readonly argsEntries = computed(() =>
    Object.entries(this.currentArgs()).map(([key, value]) => ({
      key,
      value:
        typeof value === 'object' && value !== null
          ? JSON.stringify(value, null, 2)
          : String(value),
    })),
  );

  readonly providedArgsEntries = computed(() => {
    const original = this.originalArgs();
    const res = this.resolution();
    const modified = (typeof res === 'object' ? res?.modifiedArgs : undefined) || {};
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
    if (!res || typeof res === 'string') return '';
    if (res.userInput) return res.userInput;
    const option = this.request()?.options?.find((o) => o.optionId === res.selectedOption);
    return option?.label || res.selectedOption;
  });

  readonly userInput = signal('');
  readonly selectedOptionId = signal<string | null>(null);
  readonly clarifyInput = signal('');

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

  readonly fixedOptions = computed(
    () => this.request()?.options?.filter((o) => o.optionId !== 'clarify') ?? [],
  );
  readonly clarifyOption = computed(
    () => this.request()?.options?.find((o) => o.optionId === 'clarify') ?? null,
  );

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

      const modifiedArgs: Record<string, any> = {};
      for (const [key, value] of Object.entries(current)) {
        const origValue = original[key];
        const origStr =
          typeof origValue === 'object' && origValue !== null
            ? JSON.stringify(origValue, null, 2)
            : String(origValue);
        const curStr = String(value);

        if (curStr !== origStr) {
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

  // Auto-resolution state
  readonly isAutoResolved = computed(() => !!this.resolvedResolution()?.sourceRuleId);
  readonly resolutionThought = computed(() => this.resolvedResolution()?.resolutionThought || null);
  readonly thoughtExpanded = signal(false);

  onThoughtToggle() {
    this.thoughtExpanded.update((v) => !v);
  }

  readonly appliedRuleName = computed(() => {
    const ruleId = this.resolvedResolution()?.sourceRuleId;
    if (!ruleId) return null;
    return this.autoResolutionRulesMap()[ruleId]?.name || null;
  });
  readonly appliedRuleLink = computed(() => {
    const ruleId = this.resolvedResolution()?.sourceRuleId;
    if (!ruleId) return null;
    return this.autoResolutionRulesMap()[ruleId]?.link || null;
  });
  readonly appliedRuleScope = computed(() => {
    const ruleId = this.resolvedResolution()?.sourceRuleId;
    if (!ruleId) return null;
    return this.autoResolutionRulesMap()[ruleId]?.scope || null;
  });
  readonly appliedRuleScopeLabel = computed(() => {
    const scope = this.appliedRuleScope();
    if (scope === 'ALL_USERS_OF_AGENT') return 'Always for this Agent';
    if (scope === 'USER') return 'Only for me';
    return null;
  });

  // "Remember my choice": draft values edited in the popover
  readonly conditionsText = signal('');
  readonly skipValidation = signal(false);
  readonly selectedScope = signal<THitlAutoResolutionScope>('USER');
  readonly scopeOptions = computed(() => {
    const options = [{ value: 'USER', label: 'Only for me' }];
    if (!this.blockAutoResolutionAgentLevel()) {
      options.push({ value: 'ALL_USERS_OF_AGENT', label: 'Always for this agent' });
    }
    return options;
  });

  // Confirmed config; the checkbox is checked only when this is set
  readonly rememberedConfig = signal<TAutoResolutionConfig | null>(null);
  readonly rememberChoice = computed(() => !!this.rememberedConfig());
  readonly rememberPopoverPosition = signal<'top' | 'bottom'>('top');

  // Resolution sent along with the last rule creation, kept for retry
  private readonly lastRuleResolution = signal<THitlResolution | null>(null);

  readonly saveState = computed<TItemState<string> | undefined>(
    () => this.autoResolutionMap()[this.requestId()],
  );
  readonly isSaving = computed(() => !!this.saveState()?.loading);
  readonly isSaved = computed(() => !this.isSaving() && !!this.saveState()?.value);
  readonly isSaveFailed = computed(
    () => !this.isSaving() && !this.saveState()?.value && !!this.saveState()?.error,
  );
  readonly savedRuleId = computed(() => this.saveState()?.value || null);
  readonly canRetrySave = computed(() => !!this.rememberedConfig() && !!this.lastRuleResolution());

  onConditionsChange(value: string) {
    this.conditionsText.set(value);
  }

  onSkipValidationChange(value: boolean) {
    this.skipValidation.set(value);
  }

  onScopeChange(value: string) {
    this.selectedScope.set(value as THitlAutoResolutionScope);
  }

  onRememberChoiceClick(event: Event, popover: Popover) {
    event.stopPropagation();
    const checkbox = event.target as HTMLInputElement;

    if (this.rememberChoice()) {
      // Checked -> unchecked: drop the confirmed config and clear the popover fields
      this.rememberedConfig.set(null);
      this.resetDraft();
      popover.close();
    } else if (popover.isOpen()) {
      popover.close();
    } else {
      this.resetDraft();
      this.rememberPopoverPosition.set(this.getPopoverPosition());
      popover.open();
    }

    // The checkbox only reflects rememberedConfig (checked only after Confirm).
    // Sync the DOM directly; preventDefault() would revert it after change detection.
    checkbox.checked = this.rememberChoice();
  }

  onConfirmRememberChoice(popover: Popover) {
    this.rememberedConfig.set({
      condition: this.conditionsText().trim() || undefined,
      skipValidation: this.skipValidation() || undefined,
      scope: this.selectedScope(),
    });
    popover.close();
  }

  onCancelRememberChoice(popover: Popover) {
    popover.close();
    this.resetDraft();
  }

  onRetrySaveRule() {
    const resolution = this.lastRuleResolution();
    if (resolution) this.emitSaveRule(resolution);
  }

  onViewRule() {
    const req = this.request();
    const res = this.resolvedResolution();
    if (!req || !res) return;
    const ruleId = this.savedRuleId() || res.sourceRuleId;
    this.autoResolution.emit({
      request: req,
      resolution: res,
      type: 'viewRule',
      payload: { ruleId: ruleId || undefined },
    });
  }

  private resetDraft() {
    const config = this.rememberedConfig();
    this.conditionsText.set(config?.condition ?? '');
    this.skipValidation.set(!!config?.skipValidation);
    this.selectedScope.set(config?.scope ?? 'USER');
  }

  private getPopoverPosition(): 'top' | 'bottom' {
    const el = this.elementRef.nativeElement as HTMLElement;
    const trigger = el.querySelector('.dw-ar-remember') ?? el;
    const rect = trigger.getBoundingClientRect();
    const chatWindow =
      el.closest('.dw-chat-window-messages') || el.closest('dw-chat-window');
    if (chatWindow) {
      const chatRect = chatWindow.getBoundingClientRect();
      return rect.top - chatRect.top > chatRect.height / 2 ? 'top' : 'bottom';
    }
    return rect.top > window.innerHeight / 2 ? 'top' : 'bottom';
  }

  private emitSaveRule(resolution: THitlResolution) {
    const req = this.request();
    const config = this.rememberedConfig();
    if (!req || !config) return;
    this.lastRuleResolution.set(resolution);
    this.autoResolution.emit({
      request: req,
      resolution,
      type: 'save',
      payload: config,
    });
  }

  private emitResolution(
    selectedOption: string,
    userInput?: string,
    modifiedArgs?: Record<string, any>,
  ) {
    const resolution: THitlResolution = {
      requestId: this.requestId(),
      selectedOption,
      userInput,
      modifiedArgs,
    };
    this.resolve.emit({ requestId: this.requestId(), resolution });
    if (this.rememberChoice() && this.canCreateAutoResolutionRule()) {
      this.emitSaveRule(resolution);
    }
  }
}
