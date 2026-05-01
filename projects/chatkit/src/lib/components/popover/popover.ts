import { Component, ElementRef, HostListener, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dw-popover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popover.html',
  styleUrls: ['./popover.scss'],
})
export class Popover {
  @Input() position: 'top' | 'bottom' = 'top';
  @Input() align: 'left' | 'center' | 'right' = 'center';

  isOpen = signal(false);

  constructor(private elementRef: ElementRef) {}

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}
