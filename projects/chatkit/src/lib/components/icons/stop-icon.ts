import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-stop-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
      <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" />
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
export class StopIcon {
  readonly size = input<number>(24);
}
