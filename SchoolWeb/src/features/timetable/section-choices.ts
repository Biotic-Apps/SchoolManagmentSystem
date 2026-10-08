import type { ClassOverview } from "@/features/classes/setup-types";
import type { Section } from "@/features/classes/types";
import type { TimetableState } from "./types";

export interface SectionChoice {
  id: string;
  classId: string;
  className: string;
  /** "A (Science)" */
  label: string;
  /** "Class 9 A" */
  fullName: string;
  state?: TimetableState;
}

const label = (name: string, group: string | null | undefined) => (group ? `${name} (${group})` : name);

/** Sections from the classes overview, in class order, with their timetable state. */
export function choicesFromOverview(classes: ClassOverview[]): SectionChoice[] {
  return [...classes]
    .sort((a, b) => a.levelOrder - b.levelOrder)
    .flatMap((item) =>
      item.sections.map((section) => ({
        id: section.id,
        classId: item.id,
        className: item.name,
        label: label(section.name, section.group),
        fullName: `${item.name} ${section.name}`,
        state: section.timetable,
      })),
    );
}

/** Sections from the plain sections list (teachers: only their own). */
export function choicesFromSections(sections: Section[]): SectionChoice[] {
  return sections.map((section) => ({
    id: section.id,
    classId: section.classId,
    className: section.className,
    label: label(section.name, section.group),
    fullName: `${section.className} ${section.name}`,
  }));
}
