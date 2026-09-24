import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-user-icon',
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
        d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 14.5a5.5 5.5 0 0 1 11 0 .5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5Z"
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
export class UserIcon {
  readonly size = input<number>(16);
}
