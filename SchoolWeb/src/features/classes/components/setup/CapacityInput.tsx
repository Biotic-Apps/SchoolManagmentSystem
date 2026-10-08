"use client";

import { NumberStepper } from "@/components/shared/NumberStepper";
import { useOptimisticSave } from "@/lib/use-optimistic-save";

interface CapacityInputProps {
  label: string;
  value: number | null;
  onSave: (capacity: number) => Promise<unknown>;
}

/** Seats in a section; each change is saved. */
export function CapacityInput({ label, value, onSave }: CapacityInputProps) {
  const seats = useOptimisticSave<number | null>(value, (next) => (next == null ? Promise.resolve() : onSave(next)), 600);
  return <NumberStepper label={label} value={seats.value} onChange={(next) => void seats.set(next)} min={1} max={200} />;
}
