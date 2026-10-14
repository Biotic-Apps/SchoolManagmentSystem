import {
  Award,
  BookOpen,
  Bus,
  CalendarCheck,
  GraduationCap,
  MessageSquare,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/site/cn";

type Rider = { icon: LucideIcon; angle: number; tone: string };

const OUTER: Rider[] = [
  { icon: GraduationCap, angle: 20, tone: "text-brand-600" },
  { icon: Wallet, angle: 110, tone: "text-accent-500" },
  { icon: Bus, angle: 200, tone: "text-brand-500" },
  { icon: Award, angle: 290, tone: "text-accent-600" },
];

const INNER: Rider[] = [
  { icon: CalendarCheck, angle: 65, tone: "text-brand-600" },
  { icon: MessageSquare, angle: 155, tone: "text-accent-500" },
  { icon: BookOpen, angle: 245, tone: "text-brand-500" },
  { icon: Users, angle: 335, tone: "text-brand-700" },
];

function Ring({ riders, className }: { riders: Rider[]; className: string }) {
  return (
    <div className={cn("hero-orbit-ring", className)}>
      {riders.map(({ icon: Icon, angle, tone }) => (
        // The arm turns to the rider's angle; the rider sits at its tip, turned
        // back by the same angle and then counter-spun by the ring's own loop.
        <div key={angle} className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
          <div
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
            style={{ transform: `translate(-50%, -50%) rotate(${-angle}deg)` }}
          >
            <div className="hero-orbit-upright">
              <span className="grid size-10 place-items-center rounded-full border border-white/80 bg-white/95 shadow-[0_8px_20px_-8px_rgb(42_31_107/0.35)]">
                <Icon className={cn("size-[1.15rem]", tone)} strokeWidth={2.1} />
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Two slow concentric rings behind the hero composition, with the school's
 * everyday tools riding round on them. Pure CSS loops, so it costs nothing on
 * the main thread. Shown from lg up, where it has room to sit outside the
 * devices without pushing the page sideways.
 */
export function Orbit({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute", className)}>
      <div className="relative size-full">
        <Ring riders={OUTER} className="inset-0" />
        <Ring riders={INNER} className="inset-[17%]" />
        <div className="absolute inset-[20%] rounded-full bg-[radial-gradient(circle,rgb(167_139_250/0.22),transparent_65%)]" />
      </div>
    </div>
  );
}
