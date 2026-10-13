export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

// Text fields show focus with their own border + a subtle glow ring.
export const fieldBase =
  "w-full rounded-input border border-border-strong bg-surface px-3 text-body text-fg placeholder:text-fg-muted/70 outline-none " +
  "transition-[border-color,box-shadow,background-color,color] duration-(--dur-quick) ease-standard " +
  "hover:border-primary/40 focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--primary),0_0_0_3px_rgb(123_104_238/0.10)] " +
  "disabled:cursor-not-allowed disabled:bg-background disabled:opacity-70 " +
  "aria-invalid:border-error aria-invalid:focus:border-error aria-invalid:focus:shadow-[inset_0_0_0_1px_var(--error),0_0_0_3px_rgb(220_38_38/0.10)]";

/** The one card surface: white, hairline border, subtle purple-tinted shadow. */
export const cardSurface = "rounded-card border border-border/80 bg-card-bg shadow-card transition-[shadow,border-color] duration-(--dur-standard) ease-standard hover:shadow-card-hover hover:border-border";

/**
 * Clickable card ONLY (a link/button or a card wrapping one): border tints purple and the card lifts a pixel
 * on hover; presses back down. Never put this on a static card.
 */
export const cardInteractive =
  "transition-[border-color,box-shadow,translate,background-color] duration-(--dur-standard) ease-standard cursor-pointer " +
  "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-raised active:translate-y-0 active:shadow-card " +
  "motion-reduce:hover:translate-y-0";

/** Selected card / tile: soft lavender with a purple border and subtle inner glow. */
export const cardSelected = "border-primary/60 bg-selected text-on-selected shadow-[0_0_0_1px_rgb(123_104_238/0.08),0_2px_8px_-2px_rgb(123_104_238/0.12)]";

/** Floating layer (menus, popovers, selects): white, hairline border, overlay shadow. */
export const overlaySurface = "rounded-input border border-border/70 bg-surface shadow-overlay backdrop-blur-xl";

/** Radix open/close animation for menus, popovers and tooltips: fade + 4px move from the trigger's side (data-side). */
export const popMotion =
  "data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out";
