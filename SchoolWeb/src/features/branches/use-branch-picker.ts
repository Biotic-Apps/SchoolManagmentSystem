import { useMemo, useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useActiveBranches } from "./api";
import type { Branch } from "./types";

function branchLabel(branch: Branch, multiSchool: boolean): string {
  return multiSchool ? `${branch.schoolName} › ${branch.name}` : branch.name;
}

/**
 * Branch context for branch-scoped screens (sessions, sections, rooms, calendar).
 * Defaults to the first branch in scope, so a principal with one branch never has to pick.
 */
export function useBranchPicker() {
  const { branches, isLoading, error } = useActiveBranches();
  const [chosenId, setBranchId] = useState<string | null>(null);

  const multiSchool = new Set(branches.map((branch) => branch.schoolId)).size > 1;
  const options: Option[] = useMemo(
    () => branches.map((branch) => ({ id: branch.id, name: branchLabel(branch, multiSchool) })),
    [branches, multiSchool],
  );
  const branch = branches.find((item) => item.id === chosenId) ?? branches[0] ?? null;

  return {
    branch,
    branchId: branch?.id ?? null,
    schoolId: branch?.schoolId ?? null,
    setBranchId,
    options,
    isLoading,
    error,
    /** Hide the picker when there is nothing to choose. */
    showPicker: branches.length > 1,
  };
}

export type BranchPicker = ReturnType<typeof useBranchPicker>;
