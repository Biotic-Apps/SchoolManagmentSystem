export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

// Text fields show focus with their own border only — no outer ring, so there is a single (thicker) stroke.
export const fieldBase =
  "w-full rounded-input border border-border-strong bg-surface px-3 text-body text-fg placeholder:text-fg-muted/70 transition-colors outline-none " +
  "hover:border-fg-muted/60 focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--primary)] " +
  "disabled:cursor-not-allowed disabled:bg-background disabled:opacity-70 " +
  "aria-invalid:border-error aria-invalid:focus:border-error aria-invalid:focus:shadow-[inset_0_0_0_1px_var(--error)]";
