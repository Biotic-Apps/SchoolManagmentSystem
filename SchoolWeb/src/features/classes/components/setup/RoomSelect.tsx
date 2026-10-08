"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { CreatableSelect } from "@/components/shared/CreatableSelect";
import { useOptimisticSave } from "@/lib/use-optimistic-save";

interface RoomSelectProps {
  label: string;
  options: Option[];
  value: string | null;
  onSave: (roomId: string | null) => Promise<unknown>;
  onCreate: (name: string) => Promise<Option>;
}

/** Room picker with "+ New room" that saves straight away. */
export function RoomSelect({ label, options, value, onSave, onCreate }: RoomSelectProps) {
  const choice = useOptimisticSave<string | null>(value, onSave);
  return (
    <CreatableSelect
      label={label}
      options={options}
      value={choice.value}
      onChange={(next) => void choice.set(next)}
      emptyLabel="No room"
      createLabel="New room"
      onCreate={onCreate}
    />
  );
}
