import {
  afterNextRender,
  AfterRenderRef,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  formatAbsoluteTimestamp,
  formatRelativeTimestamp,
  parseMessageTimestamp,
} from '../chat-window/utils';

const TICK_INTERVAL = 30 * 1000;
const VIEWPORT_MARGIN = 8;
const TOOLTIP_GUTTER = 6;

// One shared clock for every timestamp, so relative labels stay fresh without an interval per message.
const now = signal(Date.now());
let subscribers = 0;
let tickHandle: ReturnType<typeof setInterval> | undefined;

function subscribeToClock(): () => void {
  if (subscribers++ === 0) {
    now.set(Date.now());
    tickHandle = setInterval(() => now.set(Date.now()), TICK_INTERVAL);
  }
  return () => {
    if (--subscribers === 0) {
      clearInterval(tickHandle);
      tickHandle = undefined;
    }
  };
}

type TTooltipPosition = {
  top: number;
  left: number;
  arrowLeft: number;
  placement: 'top' | 'bottom';
};

@Component({
  selector: 'dw-timestamp',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (date()) {
      <span
        #labelEl
        class="dw-timestamp-label"
        (mouseenter)="showTooltip()"
        (mouseleave)="hideTooltip()"
      >
        {{ label() }}
      </span>
      @if (tooltipVisible()) {
        <div
          #tooltipEl
          class="dw-timestamp-tooltip"
          [class.dw-timestamp-tooltip-bottom]="tooltipPosition()?.placement === 'bottom'"
          [class.dw-timestamp-tooltip-ready]="!!tooltipPosition()"
          [style.top.px]="tooltipPosition()?.top ?? 0"
          [style.left.px]="tooltipPosition()?.left ?? 0"
          role="tooltip"
        >
          <span
            class="dw-timestamp-tooltip-arrow"
            [style.left.px]="tooltipPosition()?.arrowLeft ?? 0"
          ></span>
          <span class="dw-timestamp-tooltip-text">{{ absoluteLabel() }}</span>
        </div>
      }
    }
  `,
  styles: `
    .dw-timestamp-label {
      cursor: default;
    }

    .dw-timestamp-tooltip {
      position: fixed;
      z-index: 1100;
      max-width: 12.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      background: #3f3f46;
      color: #ffffff;
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 400;
      text-align: left;
      white-space: nowrap;
      pointer-events: none;
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -2px rgba(0, 0, 0, 0.1);
      opacity: 0;
      visibility: hidden;
    }

    .dw-timestamp-tooltip-ready {
      visibility: visible;
      animation: dw-timestamp-tooltip-fade-in 0.15s ease-out forwards;
    }

    .dw-timestamp-tooltip-arrow {
      position: absolute;
      top: 100%;
      width: 0;
      height: 0;
      margin-left: -0.25rem;
      border-style: solid;
      border-color: transparent;
      border-width: 0.25rem 0.25rem 0;
      border-top-color: #3f3f46;
    }

    .dw-timestamp-tooltip-bottom .dw-timestamp-tooltip-arrow {
      top: auto;
      bottom: 100%;
      border-width: 0 0.25rem 0.25rem;
      border-top-color: transparent;
      border-bottom-color: #3f3f46;
    }

    @keyframes dw-timestamp-tooltip-fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `,
})
export class Timestamp {
  readonly value = input<number | string | Date | null | undefined>();

  private readonly labelRef = viewChild<ElementRef<HTMLElement>>('labelEl');
  private readonly tooltipRef = viewChild<ElementRef<HTMLElement>>('tooltipEl');

  readonly date = computed(() => {
    const value = this.value();
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    return parseMessageTimestamp(value ?? undefined);
  });

  readonly absoluteLabel = computed(() => {
    const date = this.date();
    return date ? formatAbsoluteTimestamp(date) : '';
  });

  readonly relativeLabel = computed(() => {
    const date = this.date();
    return date ? formatRelativeTimestamp(date, now()) : null;
  });

  readonly label = computed(() => this.relativeLabel() ?? this.absoluteLabel());

  readonly tooltipVisible = signal(false);
  readonly tooltipPosition = signal<TTooltipPosition | null>(null);

  private readonly injector = inject(Injector);
  private positionRef?: AfterRenderRef;
  private readonly onScroll = () => this.hideTooltip();

  constructor() {
    const unsubscribe = subscribeToClock();
    inject(DestroyRef).onDestroy(() => {
      unsubscribe();
      this.hideTooltip();
    });
  }

  showTooltip() {
    // The tooltip is only needed when the label isn't already the full date time.
    if (!this.relativeLabel()) return;

    this.tooltipPosition.set(null);
    this.tooltipVisible.set(true);
    window.addEventListener('scroll', this.onScroll, true);

    // Measure once the tooltip is in the DOM. Unlike requestAnimationFrame, this doesn't stall
    // when the browser throttles frames (background or hidden tabs).
    this.positionRef?.destroy();
    this.positionRef = afterNextRender(() => this.positionTooltip(), { injector: this.injector });
  }

  hideTooltip() {
    this.positionRef?.destroy();
    this.positionRef = undefined;
    window.removeEventListener('scroll', this.onScroll, true);
    this.tooltipVisible.set(false);
    this.tooltipPosition.set(null);
  }

  private positionTooltip() {
    const label = this.labelRef()?.nativeElement;
    const tooltip = this.tooltipRef()?.nativeElement;
    if (!label || !tooltip) return;

    const anchor = label.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = tooltip;
    // The tooltip is first rendered at top/left 0, so its rect gives the fixed containing block's
    // origin. That is the viewport unless an ancestor has a transform/filter, which shifts it.
    const origin = tooltip.getBoundingClientRect();
    const anchorCenter = anchor.left + anchor.width / 2;

    const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
    const left = Math.max(VIEWPORT_MARGIN, Math.min(anchorCenter - width / 2, maxLeft));

    const fitsAbove = anchor.top - height - TOOLTIP_GUTTER >= VIEWPORT_MARGIN;
    const placement = fitsAbove ? 'top' : 'bottom';
    const top = fitsAbove
      ? anchor.top - height - TOOLTIP_GUTTER
      : anchor.bottom + TOOLTIP_GUTTER;

    this.tooltipPosition.set({
      top: top - origin.top,
      left: left - origin.left,
      arrowLeft: anchorCenter - left,
      placement,
    });
  }
}
