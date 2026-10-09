import { useMemo, useState } from "react";
import type { SkillGrid, SkillRatingInput } from "./skill-types";

const cellKey = (studentId: string, itemId: string) => `${studentId}:${itemId}`;

/** Unsaved ratings on top of the loaded grid; a reload (new data) starts clean. */
export function useSkillGridEditor(grid: SkillGrid | undefined) {
  const version = grid ? `${grid.sectionId}:${JSON.stringify(grid.students.map((s) => s.ratings))}` : "";
  const [state, setState] = useState<{ version: string; edits: Record<string, number | null> }>({ version, edits: {} });
  const edits = useMemo(() => (state.version === version ? state.edits : {}), [state, version]);

  const saved = (studentId: string, itemId: string) =>
    grid?.students.find((s) => s.studentId === studentId)?.ratings[itemId] ?? null;

  const valueOf = (studentId: string, itemId: string): number | null => {
    const key = cellKey(studentId, itemId);
    return key in edits ? edits[key] : saved(studentId, itemId);
  };

  const apply = (changes: { studentId: string; itemId: string; value: number | null }[]) =>
    setState((current) => {
      const next = { ...(current.version === version ? current.edits : {}) };
      for (const change of changes) {
        const key = cellKey(change.studentId, change.itemId);
        if (change.value === saved(change.studentId, change.itemId)) delete next[key];
        else next[key] = change.value;
      }
      return { version, edits: next };
    });

  const blanks = () =>
    (grid?.students ?? []).flatMap((student) =>
      (grid?.items ?? [])
        .filter((item) => valueOf(student.studentId, item.id) === null)
        .map((item) => ({ studentId: student.studentId, itemId: item.id })),
    );

  const changes: SkillRatingInput[] = Object.entries(edits).map(([key, value]) => {
    const [studentId, itemId] = key.split(":");
    return { studentId, itemId, value };
  });

  return {
    valueOf,
    set: (studentId: string, itemId: string, value: number | null) => apply([{ studentId, itemId, value }]),
    /** Gives every empty cell the same level (a quick start before adjusting). */
    fillBlanks: (value: number) => apply(blanks().map((cell) => ({ ...cell, value }))),
    blankCount: blanks().length,
    changes,
    dirty: changes.length > 0,
    reset: () => setState({ version, edits: {} }),
  };
}

export type SkillGridEditor = ReturnType<typeof useSkillGridEditor>;
