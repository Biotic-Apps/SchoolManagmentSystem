import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { IconTile } from "@/components/shared/IconTile";
import { cardInteractive, cardSurface, focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { EMPTY_VALUE } from "@/lib/format";
import type { PendingDefinition } from "../pending-definitions";

const TONES = {
  warning: { tile: "warning", count: "text-warning" },
  error: { tile: "error", count: "text-error" },
  idle: { tile: "neutral", count: "text-fg" },
} as const;

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
        "flex items-center gap-3 p-4",
        cardSurface,
        cardInteractive,
        focusRing,
      )}
    >
      <IconTile icon={Icon} tone={tone.tile} />
      <span className="flex min-w-0 flex-col">
        {loading ? (
          <Skeleton className="h-6 w-10" />
        ) : (
          <span className={cn("text-[22px] font-semibold leading-7 tabular-nums", tone.count)}>
            <AnimatedNumber value={tile.count ?? EMPTY_VALUE} />
          </span>
        )}
        <span className="line-clamp-2 text-caption leading-snug text-fg-muted">{tile.label}</span>
      </span>
    </Link>
  );
}
