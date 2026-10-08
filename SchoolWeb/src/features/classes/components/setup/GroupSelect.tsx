"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { CreatableSelect } from "@/components/shared/CreatableSelect";
import { useOptimisticSave } from "@/lib/use-optimistic-save";

interface GroupSelectProps {
  label: string;
  options: Option[];
  value: string | null;
  onSave: (group: string | null) => Promise<unknown>;
  emptyLabel: string;
}

/** Matric group (Science / Arts / a new one); saves straight away. */
export function GroupSelect({ label, options, value, onSave, emptyLabel }: GroupSelectProps) {
  const choice = useOptimisticSave<string | null>(value, onSave);
  const withCurrent = choice.value && !options.some((option) => option.id === choice.value)
    ? [...options, { id: choice.value, name: choice.value }]
    : options;
  return (
    <CreatableSelect
      label={label}
      options={withCurrent}
      value={choice.value}
      onChange={(next) => void choice.set(next)}
      emptyLabel={emptyLabel}
      createLabel="New group"
      onCreate={async (name) => ({ id: name, name })}
    />
  );
}
