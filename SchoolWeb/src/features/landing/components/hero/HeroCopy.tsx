import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const TRUST_CHIPS = ["Role-based access", "Works offline on Android", "Parents stay in the loop"];

/** Staggered on-load entry (pure CSS, so it plays before hydration). */
function rise(delayMs: number): CSSProperties {
  return { animationDelay: `${delayMs}ms`, animationDuration: "700ms" };
}

export function HeroCopy() {
  return (
    <div className="flex min-w-0 flex-col items-start gap-6 text-left">
      <span
        style={rise(0)}
        className={cn(
          "animate-rise-in",
          "inline-flex max-w-full items-center gap-2 rounded-full bg-white/80 py-1 pl-1.5 pr-3 text-caption font-medium text-on-selected shadow-xs ring-1 ring-inset ring-border backdrop-blur",
        )}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-selected px-2 py-0.5 font-semibold">
          <span className="animate-pulse-ring size-1.5 rounded-full bg-primary" />
          New
        </span>
        <span className="truncate">Android app + web portal</span>
        <Sparkles aria-hidden className="size-3.5 shrink-0 text-primary" />
      </span>

      <h1
        id="hero-title"
        style={rise(90)}
        className={cn(
          "animate-rise-in",
          "text-[36px] font-bold leading-[1.08] tracking-[-0.025em] text-fg sm:text-[48px] lg:text-[56px] lg:leading-[1.05]",
        )}
      >
        Run your whole school from <span className="text-gradient">one simple app</span>
      </h1>

      <p style={rise(180)} className={cn("animate-rise-in", "max-w-xl text-body text-fg-muted sm:text-[18px] sm:leading-8")}>
        Admissions, attendance, the daily diary, exams, fees and parent messaging — all in one place for admins,
        teachers, accountants and parents, on the web and on Android.
      </p>

      <div style={rise(270)} className={cn("animate-rise-in", "flex w-full flex-col gap-3 sm:w-auto sm:flex-row")}>
        <Button asChild size="lg" className="group h-13 px-6 text-[16px] font-semibold">
          <Link href="/login">
            Sign in to your school
            <ArrowRight aria-hidden className="transition-transform duration-(--dur-quick) group-hover:translate-x-0.5" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary" className="h-13 px-6 text-[16px]">
          <a href="#features">Explore features</a>
        </Button>
      </div>

      <ul style={rise(360)} className={cn("animate-rise-in", "flex flex-wrap gap-x-5 gap-y-2.5 pt-1")}>
        {TRUST_CHIPS.map((chip) => (
          <li key={chip} className="inline-flex items-center gap-2 text-label font-medium text-fg">
            <span className="grid size-5 place-items-center rounded-full bg-selected text-primary">
              <Check aria-hidden className="size-3" strokeWidth={3} />
            </span>
            {chip}
          </li>
        ))}
      </ul>
    </div>
  );
}
