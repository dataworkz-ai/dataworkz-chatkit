import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-thumbs-up-icon',
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7.18161 2.36873C7.27935 1.58679 7.94405 1 8.73207 1C10.1424 1 11.2857 2.1433 11.2857 3.55364V6.71429H14.1429C15.7208 6.71429 17 7.99347 17 9.57143V11.8571C17 14.6975 14.6975 17 11.8571 17H2.14286C1.51167 17 1 16.4883 1 15.8571V10.1429C1 9.51167 1.51167 9 2.14286 9H4.69418L6.73543 5.93813L7.18161 2.36873ZM4.42857 10.1429H2.14286V15.8571H4.42857V10.1429ZM5.57143 15.8571H11.8571C14.0663 15.8571 15.8571 14.0663 15.8571 11.8571V9.57143C15.8571 8.62466 15.0896 7.85714 14.1429 7.85714H10.1429V3.55364C10.1429 2.77449 9.51123 2.14286 8.73207 2.14286C8.52042 2.14286 8.34189 2.30046 8.31564 2.51048L7.836 6.34759L5.57143 9.74444V15.8571Z"
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
export class ThumbsUpIcon {
  readonly size = input<number>(20);
}
