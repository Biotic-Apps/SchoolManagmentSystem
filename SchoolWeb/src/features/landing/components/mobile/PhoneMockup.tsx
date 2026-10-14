import type { ReactNode } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";
import { cn } from "@/lib/cn";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
  /** Status bar time, 12-hour format. */
  time?: string;
}

/** A CSS-only Android phone: 36px rounded frame, punch-hole camera, status bar, scrollable-looking screen. */
export function PhoneMockup({ children, className, time = "9:41 AM" }: PhoneMockupProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative w-[260px] max-w-full rounded-[36px] bg-[#16112F] p-[9px] shadow-[0_30px_60px_-20px_rgb(10_6_40/0.7),0_0_0_1px_rgb(255_255_255/0.08)_inset]",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[28px] bg-[#F8F6FF]">
        <span className="absolute left-1/2 top-2 z-10 size-3 -translate-x-1/2 rounded-full bg-[#16112F] ring-2 ring-[#2A2350]" />
        <div className="flex items-center justify-between px-5 pb-1 pt-2 text-[10px] font-semibold text-fg">
          <span>{time}</span>
          <span className="flex items-center gap-1">
            <Signal className="size-3" />
            <Wifi className="size-3" />
            <BatteryFull className="size-3.5" />
          </span>
        </div>
        <div className="h-[470px] px-3 pb-4 pt-2">{children}</div>
        <span className="absolute bottom-1.5 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-fg/25" />
      </div>
    </div>
  );
}
