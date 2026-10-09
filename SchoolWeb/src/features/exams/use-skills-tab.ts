import { useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useCan } from "@/features/auth/use-can";
import { useSectionOptions } from "@/features/classes/sections-api";
import { useDialogState } from "@/lib/use-dialog-state";
import { useSaveSkillRatings, useSkillGrid } from "./skills-api";
import type { Exam } from "./types";
import { useSkillGridEditor } from "./use-skill-grid-editor";

/** Behaviour & skills tab: one section's ratings for this exam. */
export function useSkillsTab(exam: Exam) {
  const can = useCan();
  const sections = useSectionOptions(exam.branchId, exam.sessionId);
  const classIds = new Set(exam.classIds ?? []);
  const options: Option[] = sections.sections
    .filter((section) => classIds.has(section.classId))
    .map((section) => ({ id: section.id, name: `${section.className} ${section.name}` }));
  const [chosen, setSectionId] = useState<string | null>(null);
  const sectionId = chosen && options.some((option) => option.id === chosen) ? chosen : (options[0]?.id ?? null);

  const query = useSkillGrid(exam.id, sectionId);
  const grid = query.data;
  const editor = useSkillGridEditor(grid);
  const save = useSaveSkillRatings(exam.id, sectionId);
  const setup = useDialogState<true>();
  const editable = !!grid?.editable && can("exams.edit");

  return {
    options,
    sectionsLoading: sections.isLoading,
    sectionId,
    setSectionId,
    query,
    grid,
    editor,
    editable,
    saving: save.isPending,
    save: () => save.mutate(editor.changes),
    /** Branch managers edit the items and scale. */
    canSetup: can("exams.approve"),
    setup,
  };
}
