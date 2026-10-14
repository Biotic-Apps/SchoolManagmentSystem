import type { ReactNode } from "react";
import { cn } from "@/lib/site/cn";
import { Reveal } from "@/components/site/motion/Reveal";
import { AnimatedHeading } from "@/components/site/motion/AnimatedHeading";

type SectionHeadingProps = {
  /** Small uppercase label above the heading. */
  eyebrow?: string;
  /** Plain text — it is split into words so each can animate separately. */
  title: string;
  body?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

/** The heading block that opens every feature section. */
export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <Reveal>
          <p
            className={cn(
              "mb-4 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-700",
              align === "center" && "justify-center",
            )}
          >
            {eyebrow}
          </p>
        </Reveal>
      ) : null}

      <AnimatedHeading
        text={title}
        delay={0.05}
        className="text-balance text-[1.9rem] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[2.3rem] lg:text-[2.5rem]"
      />

      {body ? (
        <Reveal delay={0.22}>
          <p className="mt-5 text-pretty text-[1.02rem] leading-[1.65] text-muted">{body}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
