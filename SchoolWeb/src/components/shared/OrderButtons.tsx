"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface OrderButtonsProps {
  /** e.g. "chapter 2" — used in the buttons' accessible names. */
  label: string;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove?: () => void;
}

/** Move up / move down / remove controls for one row of a reorderable list. */
export function OrderButtons({ label, index, count, onMove, onRemove }: OrderButtonsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button variant="ghost" size="sm" onClick={() => onMove(index, index - 1)} disabled={index === 0} aria-label={`Move ${label} up`}>
        <ArrowUp />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onMove(index, index + 1)}
        disabled={index === count - 1}
        aria-label={`Move ${label} down`}
      >
        <ArrowDown />
      </Button>
      {onRemove && (
        <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove ${label}`}>
          <Trash2 />
        </Button>
      )}
    </div>
  );
}
