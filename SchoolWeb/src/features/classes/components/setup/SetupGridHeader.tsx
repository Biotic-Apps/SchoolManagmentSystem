import type { CSSProperties } from "react";

/** Column titles above a setup grid; hidden on phones where each cell carries its own label. */
export function SetupGridHeader({ titles, style }: { titles: string[]; style: CSSProperties }) {
  return (
    <div
      aria-hidden
      style={style}
      className="hidden gap-3 border-b border-border px-1 pb-2 text-caption font-semibold text-fg-muted md:grid md:[grid-template-columns:var(--cols)]"
    >
      {titles.map((title, index) => (
        <span key={`${title}-${index}`}>{title}</span>
      ))}
    </div>
  );
}
