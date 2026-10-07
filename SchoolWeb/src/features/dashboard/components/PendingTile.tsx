import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import type { PendingDefinition } from "../pending-definitions";

const TONES = {
  warning: { chip: "bg-warning-soft text-warning", count: "text-warning" },
  error: { chip: "bg-error-soft text-error", count: "text-error" },
  idle: { chip: "bg-selected text-on-selected", count: "text-fg" },
};

interface PendingTileProps {
  tile: PendingDefinition & { count: number | undefined; href: string };
  loading: boolean;
}

/** Compact count + label linking to the queue; non-zero counts are highlighted. */
export function PendingTile({ tile, loading }: PendingTileProps) {
  const Icon = tile.icon;
  const tone = TONES[tile.count ? tile.tone : "idle"];
  return (
    <Link
      href={tile.href}
      className={cn(
        "flex items-center gap-3 rounded-card border border-border bg-surface p-4 transition-colors hover:bg-selected/60",
        focusRing,
      )}
    >
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-input", tone.chip)}>
        <Icon className="size-4" />
      </span>
      <span className="flex min-w-0 flex-col">
        {loading ? (
          <Skeleton className="h-6 w-10" />
        ) : (
          <span className={cn("text-card-title font-semibold tabular-nums", tone.count)}>{formatNumber(tile.count)}</span>
        )}
        <span className="line-clamp-2 text-caption leading-snug text-fg-muted">{tile.label}</span>
      </span>
    </Link>
  );
}
