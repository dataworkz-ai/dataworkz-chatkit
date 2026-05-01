import {
  Component,
  effect,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderIcon, ChevronIcon } from '../icons';

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

  isOpen = signal(false);

  constructor(private elementRef: ElementRef) {}

  get selectedOption(): DropdownOption | undefined {
    return this.options.find((opt) => opt.value === this.value);
  }

  get displayLabel(): string {
    if (this.loading) return 'Loading...';
    return this.selectedOption?.label || this.placeholder;
  }

  toggle(): void {
    if (this.loading) return;
    this.isOpen.update((v) => !v);
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
