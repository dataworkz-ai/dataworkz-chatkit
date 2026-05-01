import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-loader-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 16 16"
      fill="none"
      class="dw-loader-icon"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-dasharray="28"
        stroke-dashoffset="8"
      />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .dw-loader-icon {
      animation: dw-loader-spin 1s linear infinite;
    }
    @keyframes dw-loader-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class LoaderIcon {
  readonly size = input<number>(16);
}
