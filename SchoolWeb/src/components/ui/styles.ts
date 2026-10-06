export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-1 focus-visible:ring-offset-background";

// Text fields show focus with their own border only — no outer ring, so there is a single stroke.
export const fieldBase =
  "w-full rounded-input border border-border bg-surface px-3 text-body text-fg placeholder:text-fg-muted/70 transition-colors outline-none " +
  "hover:border-fg-muted/40 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-60 " +
  "aria-invalid:border-error aria-invalid:focus-visible:border-error";
