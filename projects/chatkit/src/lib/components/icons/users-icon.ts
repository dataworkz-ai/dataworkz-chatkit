import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-users-icon',
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
        d="M6 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.5 14a4.5 4.5 0 0 1 9 0 .5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5ZM11 7.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM11.93 8.5a3.49 3.49 0 0 1 2.57 3.37V14a.5.5 0 0 1-.5.5h-1.5"
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
export class UsersIcon {
  readonly size = input<number>(16);
}
