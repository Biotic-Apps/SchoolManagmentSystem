"use client";

import { useRef, type KeyboardEvent } from "react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { pad } from "@/lib/time";

export type ClockMode = "hour" | "minute";

const SIZE = 232;
const CENTER = SIZE / 2;
const RADIUS = 88;
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

interface ClockFaceProps {
  mode: ClockMode;
  /** Hour 1–12 in hour mode, minute 0–59 in minute mode. */
  value: number;
  onPick: (value: number) => void;
}

function point(index: number, radius = RADIUS) {
  const angle = ((index * 30 - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

/** Analog dial: 12 hour marks, or minutes in 5-minute steps; arrow keys move around the dial. */
export function ClockFace({ mode, value, onPick }: ClockFaceProps) {
  const items = mode === "hour" ? HOURS : MINUTES;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = items.indexOf(value);
  const handIndex = mode === "hour" ? value % 12 : value / 5;
  const hand = point(handIndex, RADIUS - 18);

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + 12) % 12;
    buttons.current[next]?.focus();
  };

  return (
    <div
      role="group"
      aria-label={mode === "hour" ? "Pick the hour" : "Pick the minutes"}
      className="relative mx-auto rounded-full bg-background"
      style={{ width: SIZE, height: SIZE }}
    >
      <svg aria-hidden className="pointer-events-none absolute inset-0 text-primary" width={SIZE} height={SIZE}>
        <line x1={CENTER} y1={CENTER} x2={hand.x} y2={hand.y} stroke="currentColor" strokeWidth={2} />
        <circle cx={CENTER} cy={CENTER} r={4} fill="currentColor" />
      </svg>
      {items.map((item, index) => {
        const { x, y } = point(index);
        const selected = index === selectedIndex;
        const tabbable = selectedIndex < 0 ? index === 0 : selected;
        return (
          <button
            key={item}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            tabIndex={tabbable ? 0 : -1}
            aria-pressed={selected}
            aria-label={mode === "hour" ? `${item} o'clock` : `${pad(item)} minutes`}
            onClick={() => onPick(item)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-label tabular-nums transition-colors",
              selected ? "bg-primary font-semibold text-on-primary" : "text-fg hover:bg-selected",
              focusRing,
            )}
            style={{ left: x, top: y }}
          >
            {mode === "hour" ? item : pad(item)}
          </button>
        );
      })}
    </div>
  );
}
