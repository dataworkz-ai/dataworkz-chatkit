import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-stop-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 0.5H22C25.0376 0.5 27.5 2.96243 27.5 6V22C27.5 25.0376 25.0376 27.5 22 27.5H6C2.96243 27.5 0.5 25.0376 0.5 22V6C0.5 2.96243 2.96243 0.5 6 0.5Z"
        stroke="#FECACA"
      />
      <g clip-path="url(#clip0_4875_16741)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M9 14C9 11.2386 11.2386 9 14 9C16.7614 9 19 11.2386 19 14C19 16.7614 16.7614 19 14 19C11.2386 19 9 16.7614 9 14ZM14 8C10.6863 8 8 10.6863 8 14C8 17.3137 10.6863 20 14 20C17.3137 20 20 17.3137 20 14C20 10.6863 17.3137 8 14 8ZM11.3333 12.3333C11.3333 11.781 11.781 11.3333 12.3333 11.3333H15.6667C16.219 11.3333 16.6667 11.781 16.6667 12.3333V15.6667C16.6667 16.219 16.219 16.6667 15.6667 16.6667H12.3333C11.781 16.6667 11.3333 16.219 11.3333 15.6667V12.3333Z"
          fill="#EF4444"
        />
      </g>
      <defs>
        <clipPath id="clip0_4875_16741">
          <rect x="8" y="8" width="12" height="12" fill="white" />
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
export class StopIcon {
  readonly size = input<number>(24);
}
