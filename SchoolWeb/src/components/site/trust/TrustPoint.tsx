import {
  DatabaseBackup,
  History,
  KeyRound,
  Lock,
  MonitorSmartphone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { TRUST_POINTS } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";

export type TrustPointData = (typeof TRUST_POINTS)[number];

const ICONS: Record<TrustPointData["icon"], LucideIcon> = {
  ShieldCheck,
  KeyRound,
  DatabaseBackup,
  History,
  MonitorSmartphone,
  Lock,
};

export function TrustIcon({
  icon,
  active,
}: {
  icon: TrustPointData["icon"];
  active: boolean;
}) {
  const Icon = ICONS[icon] ?? ShieldCheck;
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl ring-1 transition-[background-color,color,transform] duration-300",
        active
          ? "scale-110 bg-brand-500 text-white ring-brand-500"
          : "bg-white text-brand-600 ring-line-strong",
      )}
    >
      <Icon className="size-[1.15rem]" strokeWidth={2} />
    </span>
  );
}

type TrustPointProps = {
  point: TrustPointData;
  active: boolean;
  /** Text alignment on lg: cards left of the shield align right, so they face it. */
  align?: "left" | "right";
};

/** One trust point as a small card. Purely presentational; the parent owns hover. */
export function TrustPoint({ point, active, align = "left" }: TrustPointProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 transition-[border-color,box-shadow,transform] duration-300",
        active
          ? "-translate-y-0.5 border-brand-300 shadow-[var(--shadow-lift),var(--shadow-glow)]"
          : "border-line shadow-[var(--shadow-soft)]",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          align === "right" && "lg:flex-row-reverse lg:text-right",
        )}
      >
        <TrustIcon icon={point.icon} active={active} />
        <h3 className="text-[1rem] font-semibold leading-snug tracking-tight">
          {point.title}
        </h3>
      </div>
      <p
        className={cn(
          "mt-3 text-pretty text-[0.88rem] leading-[1.6] text-muted",
          align === "right" && "lg:text-right",
        )}
      >
        {point.body}
      </p>
    </div>
  );
}
