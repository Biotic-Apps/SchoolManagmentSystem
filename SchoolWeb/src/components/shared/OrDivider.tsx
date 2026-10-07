/** Thin rule with a centred word, e.g. between two sign-in options. */
export function OrDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-4 flex items-center gap-3 text-caption text-fg-muted" role="separator">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
