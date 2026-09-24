export function getDistanceFromBottom(container: HTMLElement): number {
  return container.scrollHeight - container.scrollTop - container.clientHeight;
}

export function isScrolledUp(container: HTMLElement, threshold: number = 300): boolean {
  const isScrollable = container.scrollHeight > container.clientHeight;
  return isScrollable && getDistanceFromBottom(container) > threshold;
}

export function scrollToBottom(container?: HTMLElement, behavior?: ScrollBehavior): void {
  if (!container) return;

  container.scrollTo({
    top: container.scrollHeight,
    behavior: behavior,
  });
}

function centerElementInContainer(
  container: HTMLElement,
  target: HTMLElement,
  behavior: ScrollBehavior = 'smooth',
): void {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  // Only scroll if the target is not already fully visible in the viewport
  const isVisible =
    targetRect.top >= containerRect.top && targetRect.bottom <= containerRect.bottom;
  if (isVisible) {
    return;
  }

  let scrollAdjustment: number;

  if (targetRect.height > containerRect.height) {
    // If target is taller than container, align its top to the top of the container
    scrollAdjustment = targetRect.top - containerRect.top;
  } else {
    // Otherwise, center the target
    const targetCenter = targetRect.top + targetRect.height / 2;
    const containerCenter = containerRect.top + containerRect.height / 2;
    scrollAdjustment = targetCenter - containerCenter;
  }

  container.scrollBy({ top: scrollAdjustment, behavior });
}

export function centerMessageInChat(
  chatbody?: HTMLElement,
  messageId?: string,
  behavior?: ScrollBehavior,
) {
  if (!chatbody || !messageId) {
    return;
  }

  const messageEl = chatbody.querySelector(`[id="${messageId}"]`) as HTMLElement;
  if (!messageEl) {
    return;
  }

  centerElementInContainer(chatbody, messageEl, behavior);
}

export function centerStepsInChat(
  chatbody?: HTMLElement,
  messageId?: string,
  behavior?: ScrollBehavior,
): void {
  if (!chatbody || !messageId) return;

  const messageEl = chatbody.querySelector(`[id="${messageId}"]`) as HTMLElement;
  if (!messageEl) {
    return;
  }

  const stepsPanel = messageEl.querySelector('.footer-steps-panel') as HTMLElement;
  if (!stepsPanel) {
    return;
  }

  centerElementInContainer(chatbody, stepsPanel, behavior);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats a message timestamp as "23-Sep-2026, 11:27 PM" in the viewer's local time.
 * ISO strings without an offset (e.g. "2026-09-21T10:52:09.482334") are treated as UTC.
 */
export function formatMessageTimestamp(timestamp?: number | string): string {
  if (timestamp === undefined || timestamp === null || timestamp === '') return '';

  let date: Date;
  if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    const value = timestamp.trim();
    const hasOffset = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
    date = new Date(value.includes('T') && !hasOffset ? `${value}Z` : value);
  }
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const hours24 = date.getHours();
  const hours = String(hours24 % 12 || 12).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const meridiem = hours24 < 12 ? 'AM' : 'PM';
  return `${day}-${MONTHS[date.getMonth()]}-${date.getFullYear()}, ${hours}:${minutes} ${meridiem}`;
}
