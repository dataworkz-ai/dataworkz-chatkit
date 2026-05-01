import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-search-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_hitl_search)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M1.02857 5.15657C1.02857 2.87674 2.87673 1.02857 5.15656 1.02857C7.4364 1.02857 9.28458 2.87674 9.28458 5.15657C9.28458 7.4364 7.4364 9.28457 5.15656 9.28457C2.87673 9.28457 1.02857 7.43641 1.02857 5.15657ZM5.15656 0C2.30867 0 0 2.30868 0 5.15657C0 8.00447 2.30867 10.3131 5.15656 10.3131C6.39529 10.3131 7.53201 9.87636 8.42109 9.1484L11.1221 11.8494C11.3229 12.0502 11.6485 12.0502 11.8494 11.8494C12.0502 11.6485 12.0502 11.3229 11.8494 11.1221L9.14841 8.4211C9.87636 7.53201 10.3132 6.3953 10.3132 5.15657C10.3132 2.30867 8.00446 0 5.15656 0Z"
          fill="#94A3B8"
        />
      </g>
      <defs>
        <clipPath id="clip0_hitl_search">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
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
export class SendArrowIcon {
  readonly size = input<number>(12);
}
