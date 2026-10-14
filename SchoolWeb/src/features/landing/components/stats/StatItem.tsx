"use client";

import { useEffect, useRef, useState } from "react";
import { useCountUp } from "@/lib/use-count-up";
import { cn } from "@/lib/cn";

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
  detail: string;
  /** Position in the 2x2 (phone) / 1x4 (desktop) grid, used for the purple dividers. */
  index: number;
}

/** One stat cell: the number counts up from 0 the first time it scrolls into view. */
export function StatItem({ value, suffix, label, detail, index }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const shown = useCountUp(seen ? value : 0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "flex min-w-0 flex-col items-center gap-1 px-3 py-6 text-center sm:px-6 sm:py-8",
        index % 2 === 1 && "border-l border-border",
        index >= 2 && "border-t border-border lg:border-t-0",
        index === 2 && "lg:border-l",
      )}
    >
      <dt className="order-2 mt-2 text-label font-semibold text-fg sm:text-body">{label}</dt>
      <dd className="order-1 text-[34px] font-bold leading-none tracking-tight sm:text-[44px]">
        <span className="text-gradient tabular-nums" aria-hidden>
          {shown}
          {suffix}
        </span>
        <span className="sr-only">
          {value}
          {suffix}
        </span>
      </dd>
      <dd className="order-3 text-caption text-fg-muted">{detail}</dd>
    </div>
  );
}
