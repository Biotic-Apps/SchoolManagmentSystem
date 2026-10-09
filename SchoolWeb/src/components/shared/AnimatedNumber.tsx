"use client";

import type { ReactNode } from "react";
import { formatNumber } from "@/lib/format";
import { useCountUp } from "@/lib/use-count-up";

const PLAIN_COUNT = /^\d{1,3}(,\d{3})*$|^\d+$/;

function CountUp({ target }: { target: number }) {
  const shown = useCountUp(target);
  return (
    <>
      <span aria-hidden>{formatNumber(shown)}</span>
      <span className="sr-only">{formatNumber(target)}</span>
    </>
  );
}

/** Counts plain whole numbers (or "1,234" strings) up on first show; anything else renders as given. */
export function AnimatedNumber({ value }: { value: ReactNode }) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return <CountUp target={value} />;
  if (typeof value === "string" && PLAIN_COUNT.test(value)) return <CountUp target={Number(value.replace(/,/g, ""))} />;
  return <>{value}</>;
}
