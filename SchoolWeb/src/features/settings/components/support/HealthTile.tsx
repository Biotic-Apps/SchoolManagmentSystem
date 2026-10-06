import type { HealthTileData } from "../../health-tiles";

export function HealthTile({ label, value, hint }: Omit<HealthTileData, "id">) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-input border border-border bg-background/60 px-4 py-3">
      <span className="text-caption text-fg-muted">{label}</span>
      <span className="break-words text-label font-medium text-fg">{value}</span>
      {hint && <span className="text-caption tabular-nums text-fg-muted">{hint}</span>}
    </div>
  );
}
