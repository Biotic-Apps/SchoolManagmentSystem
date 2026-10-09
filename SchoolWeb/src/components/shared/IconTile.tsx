import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const TONES = {
  primary: "bg-selected text-primary ring-primary/15",
  success: "bg-success-soft text-success ring-success/15",
  warning: "bg-warning-soft text-warning ring-warning/15",
  error: "bg-error-soft text-error ring-error/15",
  info: "bg-info-soft text-info ring-info/15",
  neutral: "bg-background text-fg-muted ring-border",
};

const SIZES = { sm: "size-8 rounded-lg [&_svg]:size-4", md: "size-10 rounded-tile [&_svg]:size-[18px]", lg: "size-12 rounded-tile [&_svg]:size-5" };

export type IconTileTone = keyof typeof TONES;

interface IconTileProps {
  icon: LucideIcon;
  tone?: IconTileTone;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Tinted square holding one icon — used by KPI tiles, empty states and list leaders. */
export function IconTile({ icon: Icon, tone = "primary", size = "md", className }: IconTileProps) {
  return (
    <span aria-hidden className={cn("grid shrink-0 place-items-center ring-1 ring-inset", TONES[tone], SIZES[size], className)}>
      <Icon />
    </span>
  );
}
