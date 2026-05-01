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
