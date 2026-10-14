import type { ReactNode } from "react";
import { cn } from "@/lib/site/cn";
import { Reveal, RevealWords } from "@/components/site/motion/Reveal";
import { EyebrowPill } from "@/components/site/ui/Badge";

type SectionHeadingProps = {
  /** Small label above the heading, drawn as a pill with a pulsing dot. */
  eyebrow?: string;
  /** Plain text: it is split into words so each can lift out of its mask. */
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
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <Reveal soft className={cn("mb-5 flex", align === "center" && "justify-center")}>
          <EyebrowPill>{eyebrow}</EyebrowPill>
        </Reveal>
      ) : null}

      <RevealWords
        text={title}
        delay={0.08}
        highlight={1}
        className="text-balance text-[1.9rem] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[2.3rem] lg:text-[2.5rem]"
      />

      {body ? (
        <Reveal soft delay={0.25}>
          <p className="mt-5 text-pretty text-[1.02rem] leading-[1.65] text-muted">{body}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
