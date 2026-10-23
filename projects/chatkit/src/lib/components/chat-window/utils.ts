export function getDistanceFromBottom(container: HTMLElement): number {
  return container.scrollHeight - container.scrollTop - container.clientHeight;
}

export function centerElementInContainer(
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Parses a message timestamp into a Date.
 * ISO strings without an offset (e.g. "2026-09-21T10:52:09.482334") are treated as UTC.
 */
export function parseMessageTimestamp(timestamp?: number | string): Date | null {
  if (timestamp === undefined || timestamp === null || timestamp === '') return null;

  let date: Date;
  if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    const value = timestamp.trim();
    const hasOffset = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
    date = new Date(value.includes('T') && !hasOffset ? `${value}Z` : value);
  }
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a date as "23-Sep-2026, 11:27 PM" in the viewer's local time.
 */
export function formatAbsoluteTimestamp(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const hours24 = date.getHours();
  const hours = String(hours24 % 12 || 12).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const meridiem = hours24 < 12 ? 'AM' : 'PM';
  return `${day}-${MONTHS[date.getMonth()]}-${date.getFullYear()}, ${hours}:${minutes} ${meridiem}`;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Formats a date relative to `now`: "Just now", "4 minutes ago", "5 hours ago" (same day),
 * "Yesterday", otherwise the absolute local date time.
 * Returns null when the absolute format should be used.
 */
export function formatRelativeTimestamp(date: Date, now: number = Date.now()): string | null {
  const diff = now - date.getTime();
  if (diff < MINUTE) return 'Just now';
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const today = startOfDay(new Date(now));
  const day = startOfDay(date);
  if (day === today) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  const yesterday = startOfDay(new Date(today - 12 * HOUR));
  if (day === yesterday) return 'Yesterday';

  return null;
}
