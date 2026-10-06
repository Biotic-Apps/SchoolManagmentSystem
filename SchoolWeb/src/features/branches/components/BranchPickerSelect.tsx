"use client";

import { OptionSelect } from "@/components/shared/OptionSelect";
import type { BranchPicker } from "../use-branch-picker";

/** Branch selector bound to useBranchPicker; renders nothing when only one branch is in scope. */
type PickerProps = Pick<BranchPicker, "showPicker" | "options" | "branchId"> & { setBranchId: (id: string) => void };

export function BranchPickerSelect({ picker, className = "md:w-64" }: { picker: PickerProps; className?: string }) {
  if (!picker.showPicker) return null;
  return (
    <OptionSelect
      label="Branch"
      options={picker.options}
      value={picker.branchId}
      onChange={picker.setBranchId}
      className={className}
    />
  );
}
