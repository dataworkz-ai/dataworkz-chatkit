import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-chevron-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 12 12" fill="currentColor">
      <path
        d="M2 4L6 8L10 4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class ChevronIcon {
  readonly size = input<number>(16);
}
