import { useMemo, useState } from "react";
import { useDialogState } from "@/lib/use-dialog-state";
import { useSetSubjectTeacher } from "../setup-api";
import type { AllocationRow, ClassSetup, OverviewSection, TeachingStaff } from "../setup-types";
import { teacherOptions } from "./teacher-options";

const pairKey = (sectionId: string, subjectId: string) => `${sectionId}:${subjectId}`;

/** Subject × section teacher grid; a group subject is not taught to sections of another group. */
export function useTeachersCard(setup: ClassSetup, staff: TeachingStaff[], preferred: Set<string>) {
  const assign = useSetSubjectTeacher(setup.class.id);
  const addStaff = useDialogState<true>();
  const [filling, setFilling] = useState<string | null>(null);

  const cells = useMemo(() => {
    const map = new Map<string, AllocationRow>();
    for (const row of setup.allocation) map.set(pairKey(row.sectionId, row.subjectId), row);
    return map;
  }, [setup.allocation]);

  const options = useMemo(() => teacherOptions(staff, preferred), [staff, preferred]);
  const applies = (section: OverviewSection, group: string | null) => !group || section.group === group;
  const cell = (sectionId: string, subjectId: string) => cells.get(pairKey(sectionId, subjectId));

  const left = setup.subjects.reduce(
    (count, subject) =>
      count +
      setup.sections.filter((section) => applies(section, subject.group) && !cell(section.id, subject.subjectId)?.staff).length,
    0,
  );

  const save = (sectionId: string, subjectId: string, staffId: string | null) =>
    assign.mutateAsync({ sectionId, subjectId, staffId });

  return {
    sections: setup.sections,
    subjects: setup.subjects,
    canEdit: setup.canAllocate,
    options,
    left,
    applies,
    cell,
    save,
    addStaff,
    filling,
    /** Gives every section of this subject the teacher of the first section that has one. */
    sameForAll: async (subjectId: string, group: string | null) => {
      const targets = setup.sections.filter((section) => applies(section, group));
      const source = targets.map((section) => cell(section.id, subjectId)?.staff).find(Boolean);
      if (!source) return;
      setFilling(subjectId);
      try {
        for (const section of targets) {
          if (cell(section.id, subjectId)?.staff?.id !== source.id) await save(section.id, subjectId, source.id);
        }
      } catch {
        // toasted by the mutation
      } finally {
        setFilling(null);
      }
    },
  };
}

export type TeachersCardState = ReturnType<typeof useTeachersCard>;
