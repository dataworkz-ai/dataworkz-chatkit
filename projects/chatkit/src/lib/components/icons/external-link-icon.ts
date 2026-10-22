import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-external-link-icon',
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
      <path d="M13 9V13C13 13.5523 12.5523 14 12 14H3C2.44772 14 2 13.5523 2 13V4C2 3.44772 2.44772 3 3 3H7" />
      <path d="M10 2H14V6" />
      <path d="M7 9L14 2" />
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
export class ExternalLinkIcon {
  readonly size = input<number>(16);
}
