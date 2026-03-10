import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-check-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M11.8494 1.8645C12.0502 2.06534 12.0502 2.39097 11.8494 2.59181L4.30651 10.1347C4.10567 10.3355 3.78004 10.3355 3.5792 10.1347L0.150631 6.70609C-0.0502103 6.50525 -0.0502103 6.17963 0.150631 5.97878C0.351472 5.77794 0.6771 5.77794 0.877941 5.97878L3.94286 9.0437L11.1221 1.8645C11.3229 1.66366 11.6485 1.66366 11.8494 1.8645Z"
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
export class CheckIcon {
  readonly size = input<number>(16);
}
