import type { ReactNode } from "react";
import { CircleAlert, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

const TONES = {
  info: { className: "bg-info-soft text-info", icon: Info },
  warning: { className: "bg-warning-soft text-warning", icon: TriangleAlert },
  error: { className: "bg-error-soft text-error", icon: CircleAlert },
};

interface InlineNoticeProps {
  tone?: keyof typeof TONES;
  children: ReactNode;
  className?: string;
}

export function InlineNotice({ tone = "info", children, className }: InlineNoticeProps) {
  const { className: toneClass, icon: Icon } = TONES[tone];
  return (
    <div role="status" className={cn("flex items-start gap-2 rounded-input px-3 py-2.5 text-label", toneClass, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
