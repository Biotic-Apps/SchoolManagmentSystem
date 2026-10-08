import type { BuilderLesson, CellResult, TimetableBuilder } from "./builder-types";
import type { CellTarget } from "./builder-api";
import type { Slot } from "./types";
import { stateOf } from "./timetable-state";

const same = (slot: Slot, target: CellTarget) => slot.day === target.day && slot.periodIndex === target.periodIndex;

function recount(lessons: BuilderLesson[], removed: string | undefined, added: string | undefined): BuilderLesson[] {
  return lessons.map((lesson) => {
    const delta = (lesson.subject.id === added ? 1 : 0) - (lesson.subject.id === removed ? 1 : 0);
    return delta ? { ...lesson, placed: Math.max(0, lesson.placed + delta) } : lesson;
  });
}

/** Optimistic grid: put (or clear) one cell, adjust placed counts and the state badge. */
export function withCell(builder: TimetableBuilder, target: CellTarget, slot: Slot | null): TimetableBuilder {
  const { timetable } = builder;
  const previous = timetable.slots.find((item) => same(item, target));
  const slots = timetable.slots.filter((item) => !same(item, target));
  if (slot) slots.push(slot);
  const state = stateOf(timetable);
  const nextState = state === "PUBLISHED" ? "PUBLISHED_WITH_CHANGES" : state === "EMPTY" && slot ? "DRAFT" : state;
  return {
    ...builder,
    lessons: recount(builder.lessons, previous?.subject.id, slot?.subject.id),
    // Cell conflicts are re-checked by the server; drop the stale ones for this cell.
    conflicts: builder.conflicts.filter((conflict) => !(conflict.day === target.day && conflict.periodIndex === target.periodIndex)),
    timetable: { ...timetable, slots, state: nextState },
  };
}

/** Server answer for one cell: its conflicts, the subject's placed count and publish state. */
export function withCellResult(builder: TimetableBuilder, target: CellTarget, result: CellResult): TimetableBuilder {
  const lessons = result.lesson
    ? builder.lessons.map((lesson) => (lesson.subject.id === result.lesson?.subjectId ? { ...lesson, placed: result.lesson.placed } : lesson))
    : builder.lessons;
  const others = builder.conflicts.filter((conflict) => !(conflict.day === target.day && conflict.periodIndex === target.periodIndex));
  return {
    ...builder,
    lessons,
    conflicts: [...others, ...(result.conflicts ?? [])],
    timetable: {
      ...builder.timetable,
      state: result.state,
      canPublish: result.canPublish,
      publishBlockedReason: result.publishBlockedReason,
    },
  };
}
