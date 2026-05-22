import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-warning-circle-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 15.5C3.858 15.5.5 12.142.5 8S3.858.5 8 .5 15.5 3.858 15.5 8 12.142 15.5 8 15.5ZM8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Zm-.75 3.25a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5ZM8 11a.75.75 0 1 1 0 1.5A.75.75 0 0 1 8 11Z"
        fill="currentColor"
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
export class WarningCircleIcon {
  readonly size = input<number>(16);
}
