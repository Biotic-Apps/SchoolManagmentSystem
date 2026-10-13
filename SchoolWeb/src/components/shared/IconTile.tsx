import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const TONES = {
  primary: "bg-gradient-to-br from-selected to-[#E0D8FF] text-primary ring-primary/15",
  success: "bg-gradient-to-br from-success-soft to-[#D1FAE5] text-success ring-success/15",
  warning: "bg-gradient-to-br from-warning-soft to-[#FEF3C7] text-warning ring-warning/15",
  error: "bg-gradient-to-br from-error-soft to-[#FECACA] text-error ring-error/15",
  info: "bg-gradient-to-br from-info-soft to-[#DBEAFE] text-info ring-info/15",
  neutral: "bg-gradient-to-br from-background to-[#F3F4F6] text-fg-muted ring-border",
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
