import {
  Component,
  ContentChild,
  effect,
  ElementRef,
  EventEmitter,
  ViewChild,
  HostListener,
  Input,
  Output,
  signal,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderIcon, ChevronIcon } from '../icons';

// widest the options panel gets, even when there is more room
const PANEL_MAX_WIDTH = 320;

export interface DropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'dw-dropdown',
  standalone: true,
  imports: [CommonModule, LoaderIcon, ChevronIcon],
  templateUrl: './dropdown.html',
  styleUrls: ['./dropdown.scss'],
})
export class Dropdown {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() position: 'top' | 'bottom' = 'bottom';
  @Input() value: string | null = null;
  @Input() loading: boolean = false;
  @Input() label: string = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() onChange = new EventEmitter<DropdownOption>();

  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<any>;

  isOpen = signal(false);

  // keeps the panel inside the nearest clipping container (or the viewport)
  panelMaxWidth = signal<number | null>(null);

  @ViewChild('trigger') triggerRef?: ElementRef<HTMLElement>;

  constructor(private elementRef: ElementRef) {}

  // an empty value means nothing is selected, even if an option has an empty value
  get selectedOption(): DropdownOption | undefined {
    if (!this.value) return undefined;
    return this.options.find((opt) => opt.value === this.value);
  }

  get displayLabel(): string {
    if (this.loading) return 'Loading...';
    return this.selectedOption?.label || this.placeholder;
  }

  toggle(): void {
    if (this.loading) return;
    if (!this.isOpen()) {
      this.panelMaxWidth.set(this.getAvailableWidth());
    }
    this.isOpen.update((v) => !v);
  }

  private getAvailableWidth(): number | null {
    const trigger = this.triggerRef?.nativeElement;
    if (!trigger) return null;

    const gutter = 8;
    const left = trigger.getBoundingClientRect().left;
    let right = document.documentElement.clientWidth;

    // walk up to the first ancestor that clips horizontally; a shadow host (the chatkit
    // element) also bounds it, so the panel never spills outside the widget
    let node: Element | null = trigger.parentElement;
    while (node) {
      if (getComputedStyle(node).overflowX !== 'visible') {
        right = Math.min(right, node.getBoundingClientRect().right);
        break;
      }
      const host: Element | null = node.parentElement
        ? null
        : ((node.getRootNode() as ShadowRoot).host ?? null);
      if (host) {
        right = Math.min(right, host.getBoundingClientRect().right);
      }
      node = node.parentElement || host;
    }

    return Math.max(Math.min(right - left - gutter, PANEL_MAX_WIDTH), trigger.offsetWidth);
  }

  selectOption(option: DropdownOption): void {
    this.value = option.value;
    this.valueChange.emit(option.value);
    this.onChange.emit(option);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
