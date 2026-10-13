import { cn } from "@/lib/cn";

const TONE_CLASS = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
};

interface ProgressBarProps {
  /** 0–100 */
  percent: number;
  label?: string;
  tone?: keyof typeof TONE_CLASS;
  className?: string;
}

export function ProgressBar({ percent, label, tone = "primary", className }: ProgressBarProps) {
  const value = Math.min(100, Math.max(0, Math.round(percent)));
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={label}
        className="h-2 flex-1 overflow-hidden rounded-full bg-border/70"
      >
        <div className={cn("h-full rounded-full transition-[width] duration-(--dur-slow) ease-standard", TONE_CLASS[tone])} style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 text-right text-caption tabular-nums text-fg-muted">{value}%</span>
    </div>
  );
}
