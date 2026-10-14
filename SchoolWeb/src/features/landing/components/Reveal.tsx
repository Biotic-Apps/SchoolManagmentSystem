"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in ms once the element scrolls into view (use for staggering siblings). */
  delay?: number;
  /** Entry direction. "up" rises 24px, "left"/"right" slide in 32px, "scale" grows from 0.96. */
  from?: "up" | "left" | "right" | "scale";
  as?: "div" | "li" | "article";
}

/** Fades + moves its children in the first time they scroll into view. Reduced motion → plain fade. */
export function Reveal({ children, className, delay = 0, from = "up", as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-reveal={from}
      data-shown={shown || undefined}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      className={cn("reveal", className)}
    >
      {children}
    </Tag>
  );
}
