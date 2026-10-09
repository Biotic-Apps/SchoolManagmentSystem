export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

// Text fields show focus with their own border only — no outer ring, so there is a single (thicker) stroke.
export const fieldBase =
  "w-full rounded-input border border-border-strong bg-surface px-3 text-body text-fg placeholder:text-fg-muted/70 transition-colors outline-none " +
  "hover:border-fg-muted/60 focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--primary)] " +
  "disabled:cursor-not-allowed disabled:bg-background disabled:opacity-70 " +
  "aria-invalid:border-error aria-invalid:focus:border-error aria-invalid:focus:shadow-[inset_0_0_0_1px_var(--error)]";

/** The one card surface: white, hairline border, barely-there shadow. */
export const cardSurface = "rounded-card border border-border bg-surface shadow-card";

/** Clickable card: border tints teal and the card lifts a pixel on hover; presses back down. */
export const cardInteractive =
  "transition-[border-color,box-shadow,translate,background-color] duration-180 ease-standard " +
  "hover:-translate-y-px hover:border-primary/35 hover:shadow-raised active:translate-y-0 active:shadow-card " +
  "motion-reduce:hover:translate-y-0";

/** Selected card / tile: soft mint with a teal border. */
export const cardSelected = "border-primary bg-selected text-on-selected";

/** Floating layer (menus, popovers, selects): white, hairline border, overlay shadow. */
export const overlaySurface = "rounded-input border border-border bg-surface shadow-overlay";

/** Radix open/close animation for menus and popovers; grows from the trigger. */
export const popMotion =
  "data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out";
