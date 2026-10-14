"use client";

import {
  Calculator,
  GraduationCap,
  School,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { HOW_COPY } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";
import { useLoopStep } from "./useLoopStep";

const ICONS: LucideIcon[] = [School, GraduationCap, Calculator, UserRound];
const TONES = [
  "from-brand-500 to-brand-700",
  "from-sky-400 to-indigo-500",
  "from-violet-400 to-brand-600",
  "from-accent-400 to-accent-600",
];
/** Where each avatar lands when the fan opens: an offset from centre (in container
 *  width units, so it fits at 360px and at 1440px) and a slight tilt. */
const FAN = [
  { x: -37, r: -9 },
  { x: -12.5, r: -3 },
  { x: 12.5, r: 3 },
  { x: 37, r: 9 },
];

/** Step 3: one school account splitting into four role portals. */
export function RoleFan() {
  const { ref, step } = useLoopStep(1, 900, 2800);
  const open = step >= 1;

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative h-[8.75rem] overflow-hidden rounded-xl border border-line bg-white"
    >
      <p className="absolute inset-x-0 top-3 text-center text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-faint">
        One school, four portals
      </p>
      <div className="absolute inset-x-0 top-10 h-20 [container-type:inline-size]">
        {HOW_COPY.roles.map((role, i) => {
          const Icon = ICONS[i] ?? UserRound;
          const fan = FAN[i] ?? { x: 0, r: 0 };
          return (
            <div
              key={role}
              className="absolute left-1/2 top-0 flex w-[4.5rem] flex-col items-center transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                transform: `translateX(calc(-50% + ${open ? fan.x : (i - 1.5) * 2}cqw)) rotate(${open ? fan.r : 0}deg) scale(${open ? 1 : 0.85})`,
                transitionDelay: open ? `${i * 80}ms` : "0ms",
                zIndex: 4 - i,
              }}
            >
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-full bg-gradient-to-br text-white shadow-[0_8px_18px_-8px_rgb(91_75_199/0.7)] ring-2 ring-white",
                  TONES[i],
                )}
              >
                <Icon className="size-5" />
              </span>
              <span
                className={cn(
                  "mt-2 whitespace-nowrap text-[0.68rem] font-semibold transition-opacity duration-500",
                  open ? "opacity-100" : "opacity-0",
                )}
              >
                {role}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
