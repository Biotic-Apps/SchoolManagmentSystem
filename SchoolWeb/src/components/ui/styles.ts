export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

// Text fields show focus with their own border only — no outer ring, so there is a single (thicker) stroke.
export const fieldBase =
  "w-full rounded-input border border-border-strong bg-surface px-3 text-body text-fg placeholder:text-fg-muted/70 outline-none " +
  "transition-[border-color,box-shadow,background-color,color] duration-(--dur-quick) ease-standard " +
  "hover:border-fg-muted/60 focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--primary)] " +
  "disabled:cursor-not-allowed disabled:bg-background disabled:opacity-70 " +
  "aria-invalid:border-error aria-invalid:focus:border-error aria-invalid:focus:shadow-[inset_0_0_0_1px_var(--error)]";

/** The one card surface: white, hairline border, barely-there shadow. */
export const cardSurface = "rounded-card border border-border bg-surface shadow-card transition-shadow duration-(--dur-quick) ease-standard hover:shadow-sm";

/**
 * Clickable card ONLY (a link/button or a card wrapping one): border tints purple and the card lifts a pixel
 * on hover; presses back down. Never put this on a static card.
 */
export const cardInteractive =
  "transition-[border-color,box-shadow,translate,background-color] duration-(--dur-quick) ease-standard " +
  "hover:-translate-y-px hover:border-primary/35 hover:shadow-raised active:translate-y-0 active:shadow-card " +
  "motion-reduce:hover:translate-y-0";

/** Selected card / tile: soft lavender with a purple border. */
export const cardSelected = "border-primary bg-selected text-on-selected";

/** Floating layer (menus, popovers, selects): white, hairline border, overlay shadow. */
export const overlaySurface = "rounded-input border border-border bg-surface shadow-overlay";

/** Radix open/close animation for menus, popovers and tooltips: fade + 4px move from the trigger's side (data-side). */
export const popMotion =
  "data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out";
