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

/** Light lavender side panel of the sign-in pages (desktop only): branding, highlights and a stat card. */
export function AuthBrandPanel({ schoolName, logoUrl }: AuthBrandPanelProps) {
  return (
    <aside className="relative isolate m-3 hidden flex-col justify-between gap-10 rounded-[28px] border border-border/70 bg-gradient-to-br from-selected via-selected/60 to-background px-10 py-10 text-fg lg:flex xl:px-14">
      {/* Decoration is clipped in its own layer so the content (logo included) is never cut off. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
        <div className="auth-dot-grid absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="auth-drift absolute -right-24 -top-24 size-80 rounded-full bg-card-bg/80 blur-3xl" />
        <div className="auth-drift absolute -bottom-32 -left-20 size-96 rounded-full bg-primary/10 blur-3xl" style={{ animationDelay: "-8s" }} />
      </div>

      <div className="flex items-center gap-3" style={riseIn(0)}>
        <BrandLogo logoUrl={logoUrl} size="md" className="shadow-sm" />
        <span className="text-card-title font-semibold text-fg">{schoolName}</span>
      </div>

      <div className="flex flex-col gap-10">
        <div className="self-end xl:mr-6" style={riseIn(1)}>
          <AuthStatCard className="auth-float" />
        </div>
        <div className="flex max-w-md flex-col gap-6">
          <h2 className="text-[32px] font-bold leading-[40px] tracking-tight text-fg" style={riseIn(1)}>
            Your whole school, <span className="text-primary">one simple app.</span>
          </h2>
          <ul className="flex flex-col gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }, index) => (
              <li key={text} className="flex items-center gap-3 text-body text-on-selected" style={riseIn(index + 2)}>
                <span className="grid size-9 shrink-0 place-items-center rounded-tile border border-border bg-surface text-primary shadow-xs">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="flex items-center gap-2 text-caption font-medium text-on-selected" style={riseIn(5)}>
        <ShieldCheck className="size-4 shrink-0 text-primary" />
        Only accounts registered by your school can sign in.
      </p>
    </aside>
  );
}
