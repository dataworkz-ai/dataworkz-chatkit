import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-agent-avatar-icon',
  template: `<svg
    xmlns="http://www.w3.org/2000/svg"
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 36 36"
    fill="none"
  >
    <g filter="url(#filter0_d_2731_42057)">
      <rect x="2" y="1" width="32" height="32" rx="16" fill="white" />
      <rect x="2.5" y="1.5" width="31" height="31" rx="15.5" stroke="#E5E7EB" />
      <g filter="url(#filter1_d_2731_42057)">
        <path
          d="M20.7819 16.0218C20.7819 16.6865 19.6033 17.2544 18.8593 17.2544C18.8593 15.0791 18.8593 12.9031 18.8593 10.7278C18.8593 10.0631 20.0373 9.49512 20.7819 9.49512C20.7819 11.6705 20.7819 13.8458 20.7819 16.0218Z"
          fill="white"
        />
        <mask
          id="mask0_2731_42057"
          style="mask-type:luminance"
          maskUnits="userSpaceOnUse"
          x="18"
          y="9"
          width="3"
          height="9"
        >
          <path
            d="M20.78 16.022C20.78 16.6867 19.6013 17.2547 18.8573 17.2547C18.8573 15.0794 18.8573 12.9034 18.8573 10.728C18.8573 10.0634 20.0353 9.49536 20.78 9.49536C20.78 11.6707 20.78 13.846 20.78 16.022Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask0_2731_42057)">
          <path d="M20.7801 9.49585H18.8574V17.2558H20.7801V9.49585Z" fill="#55AE47" />
        </g>
        <path
          d="M21.8169 9.33767V20.983C21.8169 23.0903 20.1082 24.799 18.0009 24.799C16.3782 24.799 14.9922 23.7863 14.4409 22.3583C14.1009 21.307 14.2089 20.4703 14.2849 20.1137C14.5089 19.151 15.0975 18.3277 15.8975 17.7983C16.4535 17.4303 17.1115 17.2043 17.8202 17.171V11.8243C17.0762 11.8243 15.8975 12.773 15.8975 13.881V15.6417C13.7689 16.481 12.2622 18.5557 12.2622 20.9823C12.2622 24.1517 14.8315 26.721 18.0002 26.721C21.1695 26.721 23.7389 24.1517 23.7389 20.9823V7.28101C22.9949 7.28101 21.8169 8.22901 21.8169 9.33767Z"
          fill="#3876BC"
        />
      </g>
    </g>
    <defs>
      <filter
        id="filter0_d_2731_42057"
        x="0"
        y="0"
        width="36"
        height="36"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="1" />
        <feGaussianBlur stdDeviation="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2731_42057" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_2731_42057"
          result="shape"
        />
      </filter>
      <filter
        id="filter1_d_2731_42057"
        x="7.97333"
        y="7"
        width="20.0533"
        height="20.0533"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="0.0266667" />
        <feGaussianBlur stdDeviation="0.0133333" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2731_42057" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_2731_42057"
          result="shape"
        />
      </filter>
    </defs>
  </svg>`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class AgentAvatarIcon {
  readonly size = input<number>(32);
}
