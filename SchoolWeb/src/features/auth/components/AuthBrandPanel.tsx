import type { CSSProperties } from "react";
import { CalendarCheck, MessageSquare, ShieldCheck, Wallet } from "lucide-react";
import { BrandLogo } from "@/features/branding/components/BrandLogo";
import { AuthStatCard } from "./AuthStatCard";

const HIGHLIGHTS = [
  { icon: CalendarCheck, text: "Attendance, diary and results in one place" },
  { icon: Wallet, text: "Fees, challans and receipts" },
  { icon: MessageSquare, text: "Parents and teachers stay in touch" },
];

/** Rise-in on page load, staggered by `index` (reduced motion: fade only, via --motion-shift). */
function riseIn(index: number): CSSProperties {
  return { animation: `page-in 600ms var(--motion-ease-decelerate) ${200 + index * 120}ms backwards` };
}

interface AuthBrandPanelProps {
  schoolName: string;
  logoUrl?: string | null;
}

/** Left purple panel of the sign-in pages (desktop only): branding, highlights and a floating stat card. */
export function AuthBrandPanel({ schoolName, logoUrl }: AuthBrandPanelProps) {
  return (
    <aside className="relative isolate hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-[#6A5ACD] to-[#3B2D8F] p-12 text-white lg:flex">
      <div aria-hidden className="bg-dot-grid absolute inset-0 -z-10 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div aria-hidden className="animate-drift absolute -right-24 -top-24 -z-10 size-80 rounded-full bg-white/[0.12] blur-3xl" />
      <div aria-hidden className="animate-drift absolute -bottom-32 -left-20 -z-10 size-96 rounded-full bg-[#2A1F6B]/60 blur-3xl" style={{ animationDelay: "-8s" }} />
      <div aria-hidden className="animate-drift absolute right-1/4 top-1/2 -z-10 size-64 rounded-full bg-accent-pink/20 blur-3xl" style={{ animationDelay: "-16s" }} />

      <div className="flex items-center gap-3" style={riseIn(0)}>
        <BrandLogo logoUrl={logoUrl} size="md" />
        <span className="text-card-title font-semibold">{schoolName}</span>
      </div>

      <div className="flex flex-col gap-8">
        <div className="self-end xl:mr-8" style={riseIn(1)}>
          <AuthStatCard className="animate-float" />
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="text-[34px] font-bold leading-tight tracking-tight" style={riseIn(1)}>
            Your whole school, one simple app.
          </h2>
          <ul className="flex flex-col gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }, index) => (
              <li key={text} className="flex items-center gap-3 text-body text-white/90" style={riseIn(index + 2)}>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.12] shadow-[0_2px_8px_rgb(0_0_0/0.1)] ring-1 ring-inset ring-white/[0.12] backdrop-blur-sm">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-caption text-white/80" style={riseIn(5)}>
        <ShieldCheck className="size-4" />
        Only accounts registered by your school can sign in.
      </p>
    </aside>
  );
}
