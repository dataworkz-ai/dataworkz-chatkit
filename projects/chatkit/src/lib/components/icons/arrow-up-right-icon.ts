import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-arrow-up-right-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4.5 11.5L11.5 4.5M5.5 4.5H11.5V10.5" />
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
export class ArrowUpRightIcon {
  readonly size = input<number>(16);
}
