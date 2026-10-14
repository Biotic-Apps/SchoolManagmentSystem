"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Bell, Check, ClipboardCheck, LayoutDashboard, MessageSquareText, WifiOff } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { Section } from "@/components/site/ui/Section";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { CountUp } from "@/components/site/motion/CountUp";
import { FLOW_COPY, FLOW_DEMO } from "@/lib/site/content";

const EASE = [0.16, 1, 0.3, 1] as const;

/** When each step lights up, in ms after the section scrolls into view. */
const STEP_AT = [0, 2000, 3700] as const;

type Status = (typeof FLOW_DEMO.students)[number]["status"];

const STATUS_STYLE: Record<Status, string> = {
  present: "bg-brand-50 text-brand-700 ring-brand-200",
  absent: "bg-accent-50 text-accent-700 ring-accent-200",
  late: "bg-amber-50 text-amber-700 ring-amber-200",
};

const STATUS_LABEL: Record<Status, string> = {
  present: FLOW_COPY.present,
  absent: FLOW_COPY.absent,
  late: FLOW_COPY.late,
};

/**
 * The clearest thing eSchool does: one register, three people informed. The
 * section plays the chain step by step — the teacher marks the class, the
 * absent child's parent gets the SMS, the principal's numbers move — the first
 * time it scrolls into view.
 */
export function AttendanceFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduced = useReducedMotion();
  /** 0 = waiting, 1..3 = the step currently reached. */
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      const id = window.setTimeout(() => setStep(3), 0);
      return () => window.clearTimeout(id);
    }
    const timers = STEP_AT.map((at, index) => window.setTimeout(() => setStep(index + 1), at));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [inView, reduced]);

  return (
    <Section id="attendance-flow">
      <SectionHeading eyebrow={FLOW_COPY.eyebrow} title={FLOW_COPY.title} body={FLOW_COPY.body} />

      <div
        ref={ref}
        className="mt-16 grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-4"
      >
        <StepCard index={1} step={step} icon={ClipboardCheck} label={FLOW_COPY.steps.teacher}>
          <TeacherRegister step={step} />
        </StepCard>
        <Connector lit={step >= 2} />
        <StepCard index={2} step={step} icon={MessageSquareText} label={FLOW_COPY.steps.parent}>
          <ParentMessage step={step} />
        </StepCard>
        <Connector lit={step >= 3} />
        <StepCard index={3} step={step} icon={LayoutDashboard} label={FLOW_COPY.steps.principal}>
          <PrincipalDashboard step={step} />
        </StepCard>
      </div>

      <p className="mx-auto mt-10 flex max-w-2xl items-start gap-2 rounded-card bg-info-soft p-3 text-[0.82rem] leading-relaxed text-muted">
        <WifiOff className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.2} />
        {FLOW_COPY.offlineNote}
      </p>
    </Section>
  );
}

type StepCardProps = {
  index: number;
  step: number;
  icon: typeof Bell;
  label: string;
  children: React.ReactNode;
};

function StepCard({ index, step, icon: Icon, label, children }: StepCardProps) {
  const active = step === index;
  const done = step > index;
  return (
    <div
      className={cn(
        "card-surface relative flex min-w-0 flex-col p-5 transition-[box-shadow,border-color,opacity] duration-500 sm:p-6",
        active && "border-brand-300 shadow-[var(--shadow-lift)]",
        step < index && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-full text-[0.72rem] font-bold tabular-nums transition-colors duration-500",
            done || active ? "bg-brand-600 text-white" : "bg-surface-sunken text-faint",
          )}
        >
          {done ? <Check className="size-3.5" strokeWidth={3} /> : index}
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-faint">
          <Icon className="size-3.5 shrink-0" strokeWidth={2.2} />
          <span className="leading-snug">{label}</span>
        </span>
      </div>
      <div className="mt-5 flex-1">{children}</div>
    </div>
  );
}

function Connector({ lit }: { lit: boolean }) {
  return (
    <div className="flex items-center justify-center">
      <span
        className={cn(
          "grid size-10 place-items-center rounded-full transition-[background-color,color,box-shadow,transform] duration-500",
          lit
            ? "scale-100 bg-brand-600 text-white shadow-[0_10px_24px_-10px_rgb(123_104_238/0.8)]"
            : "scale-90 bg-surface-sunken text-faint",
        )}
      >
        <ArrowRight className="size-4.5 rotate-90 lg:rotate-0" strokeWidth={2.4} />
      </span>
    </div>
  );
}

function TeacherRegister({ step }: { step: number }) {
  const started = step >= 1;
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-lg font-semibold tracking-tight">{FLOW_DEMO.className}</p>
        <p className="text-xs text-faint">{FLOW_DEMO.date}</p>
      </div>
      <ul className="mt-4 divide-y divide-dashed divide-line text-sm">
        {FLOW_DEMO.students.map((student, index) => (
          <li key={student.roll} className="flex items-center justify-between gap-3 py-2.5">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="font-mono text-xs text-faint">{student.roll}</span>
              <span className="truncate font-medium">{student.name}</span>
            </span>
            <motion.span
              data-motion
              initial={false}
              animate={started ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.35, delay: started ? 0.2 + index * 0.24 : 0, ease: EASE }}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ring-1",
                STATUS_STYLE[student.status],
              )}
            >
              {STATUS_LABEL[student.status]}
            </motion.span>
          </li>
        ))}
      </ul>
      <motion.div
        data-motion
        initial={false}
        animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: 0.4, delay: started ? 1.5 : 0, ease: EASE }}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border-2 border-brand-500/60 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-brand-600"
      >
        <Check className="size-3.5" strokeWidth={3} />
        {FLOW_COPY.saved}
      </motion.div>
    </div>
  );
}

function ParentMessage({ step }: { step: number }) {
  const shown = step >= 2;
  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {shown && (
          <motion.div
            key="push"
            data-motion
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3 shadow-[var(--shadow-lift)]"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
              <Bell className="size-4" strokeWidth={2.2} />
            </span>
            <span className="min-w-0">
              <span className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold">{FLOW_COPY.pushTitle}</span>
                <span className="text-faint">{FLOW_COPY.smsTime}</span>
              </span>
              <span className="mt-0.5 block text-[0.8rem] leading-snug text-muted">
                {FLOW_DEMO.absentName} · {FLOW_DEMO.className}
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl bg-surface-sunken p-3.5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-faint">
          SMS · {FLOW_COPY.smsFrom}
        </p>
        <motion.div
          data-motion
          initial={false}
          animate={shown ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
          transition={{ duration: 0.5, delay: shown ? 0.45 : 0, ease: EASE }}
          className="mt-2.5 max-w-[95%] rounded-2xl rounded-tl-sm bg-surface p-3 text-[0.84rem] leading-relaxed shadow-[var(--shadow-card)]"
        >
          {FLOW_DEMO.sms}
          <span className="mt-1.5 block text-right text-[0.68rem] text-faint">{FLOW_DEMO.sentAt}</span>
        </motion.div>
      </div>
    </div>
  );
}

function PrincipalDashboard({ step }: { step: number }) {
  const shown = step >= 3;
  const { totals, strength } = FLOW_DEMO;
  const presentShare = Math.round(((totals.present + totals.late) / strength) * 100);
  const rows = [
    { key: "present", label: FLOW_COPY.presentLabel, value: totals.present, tone: "bg-brand-500" },
    { key: "absent", label: FLOW_COPY.absentLabel, value: totals.absent, tone: "bg-accent-500" },
    { key: "late", label: FLOW_COPY.lateLabel, value: totals.late, tone: "bg-amber-500" },
  ] as const;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-lg font-semibold tracking-tight">{FLOW_COPY.dashboardTitle}</p>
        <motion.span
          data-motion
          initial={false}
          animate={shown ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: shown ? 1.1 : 0 }}
          className="shrink-0 whitespace-nowrap rounded-full bg-brand-50 px-2 py-0.5 text-[0.68rem] font-semibold text-brand-700"
        >
          {FLOW_COPY.updated} {FLOW_DEMO.sentAt}
        </motion.span>
      </div>

      <p className="mt-4 text-4xl font-bold tracking-tight tabular-nums">
        {shown ? <CountUp value={presentShare} suffix="%" decimals={0} durationMs={1100} /> : "0"}
      </p>

      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface-sunken">
        {rows.map((row) => (
          <motion.span
            key={row.key}
            data-motion
            initial={false}
            animate={{ width: shown ? `${(row.value / strength) * 100}%` : "0%" }}
            transition={{ duration: 0.9, delay: shown ? 0.2 : 0, ease: EASE }}
            className={cn("h-full", row.tone)}
          />
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
        {rows.map((row) => (
          <div key={row.key} className="rounded-xl bg-surface-sunken px-1 py-2.5">
            <dt className="text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-faint">{row.label}</dt>
            <dd className="mt-1 text-lg font-bold tabular-nums">
              {shown ? <CountUp value={row.value} decimals={0} durationMs={1100} /> : "0"}
            </dd>
          </div>
        ))}
      </dl>

      <motion.p
        data-motion
        initial={false}
        animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: 0.4, delay: shown ? 1.3 : 0, ease: EASE }}
        className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2.5 text-[0.8rem] text-muted"
      >
        <Bell className="size-3.5 shrink-0 text-brand-600" strokeWidth={2.2} />
        <span>
          {FLOW_COPY.alertsSent}{" "}
          <span className="font-semibold tabular-nums text-foreground">{totals.absent}</span>
        </span>
      </motion.p>
    </div>
  );
}
