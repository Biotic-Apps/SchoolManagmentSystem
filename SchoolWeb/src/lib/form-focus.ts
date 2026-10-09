const FOCUSABLE = "input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex='-1'])";

/**
 * Moves focus to the first invalid field (in on-screen order) once its error has rendered.
 * Covers custom pickers that react-hook-form cannot focus itself: their error text
 * (`<id>-error`) points back at the field, or sits inside its FormField.
 */
export function focusFirstInvalid(form: HTMLFormElement | null | undefined) {
  if (!form) return;
  requestAnimationFrame(() => {
    const invalid = form.querySelector<HTMLElement>("[aria-invalid='true']");
    const message = form.querySelector<HTMLElement>("[id$='-error'][role='alert']");
    const fromMessage = message
      ? (document.getElementById(message.id.slice(0, -"-error".length)) ?? message.parentElement)
      : null;
    const candidates = [invalid, fromMessage].filter((el): el is HTMLElement => !!el);
    // Whichever comes first on the page wins.
    candidates.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    const target = candidates[0];
    if (!target || target.contains(document.activeElement)) return;
    const focusable = target.matches(FOCUSABLE) ? target : target.querySelector<HTMLElement>(FOCUSABLE);
    focusable?.focus();
  });
}

/** The form a submit event came from (react-hook-form passes the event through). */
export function formOf(event: { target?: unknown } | undefined): HTMLFormElement | null {
  const target = event?.target;
  return target instanceof HTMLFormElement ? target : null;
}
