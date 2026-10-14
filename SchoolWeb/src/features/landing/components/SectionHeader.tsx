import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  /** "dark" for sections on the deep purple background. */
  tone?: "light" | "dark";
  className?: string;
}

/** Eyebrow pill + big heading + one-line intro, shared by every landing section. */
export function SectionHeader({ eyebrow, title, description, align = "center", tone = "light", className }: SectionHeaderProps) {
  const dark = tone === "dark";
  return (
    <Reveal className={cn("flex flex-col gap-4", align === "center" ? "mx-auto max-w-2xl items-center text-center" : "max-w-xl items-start", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-caption font-semibold uppercase tracking-[0.12em]",
          dark ? "bg-white/10 text-white ring-1 ring-inset ring-white/15" : "bg-selected text-on-selected ring-1 ring-inset ring-border",
        )}
      >
        <span className={cn("size-1.5 rounded-full", dark ? "bg-white" : "bg-primary")} />
        {eyebrow}
      </span>
      <h2 className={cn("text-[32px] font-bold leading-[1.15] tracking-tight sm:text-[40px]", dark ? "text-white" : "text-fg")}>{title}</h2>
      {description && <p className={cn("text-body sm:text-[18px] sm:leading-7", dark ? "text-white/75" : "text-fg-muted")}>{description}</p>}
    </Reveal>
  );
}
