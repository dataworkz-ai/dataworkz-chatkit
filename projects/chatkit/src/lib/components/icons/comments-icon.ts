import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-comments-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.3"
      stroke-linecap="round"
      stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.5 6.5C10.5 8.71 8.48 10.5 6 10.5C5.3 10.5 4.64 10.36 4.05 10.11L1.5 11L2.3 8.9C1.79 8.2 1.5 7.38 1.5 6.5C1.5 4.29 3.52 2.5 6 2.5C8.48 2.5 10.5 4.29 10.5 6.5Z"
      />
      <path
        d="M6.6 12.4C7.38 13.08 8.46 13.5 9.65 13.5C10.3 13.5 10.92 13.37 11.47 13.14L13.9 14L13.15 12.03C13.69 11.36 14 10.55 14 9.68C14 8.42 13.33 7.29 12.27 6.55"
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
export class CommentsIcon {
  readonly size = input<number>(16);
}
