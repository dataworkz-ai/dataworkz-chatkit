import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-bolt-icon',
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
        d="M9.222 1.028a.5.5 0 0 1 .178.472L8.466 5.5h3.284a.5.5 0 0 1 .39.812l-5.5 6.875a.5.5 0 0 1-.89-.34L6.684 9H3.75a.5.5 0 0 1-.39-.812l5.5-7.5a.5.5 0 0 1 .362-.16z"
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
export class BoltIcon {
  readonly size = input<number>(16);
}
