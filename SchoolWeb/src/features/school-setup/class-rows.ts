import { LEVEL_PRESETS, MATRIC_GROUPS, levelOfClass, presetFor, type ClassLevel } from "@/features/classes/level-presets";

export interface SectionRowValue {
  name: string;
  /** "" = no group. */
  group: string;
}

export interface SubjectCellValue {
  name: string;
  periodsPerWeek: number;
  /** "" = all sections. */
  group: string;
}

export interface ClassRowValue {
  include: boolean;
  name: string;
  level: ClassLevel;
  /** Typed by the admin (not from a preset): the name stays editable. */
  custom: boolean;
  sections: SectionRowValue[];
  subjects: SubjectCellValue[];
}

export const SECTION_LETTERS = ["A", "B", "C", "D"];
export const MAX_SECTIONS = 8;

/** Matric classes start as A (Science) and B (Arts); everyone else as A. */
export function defaultSections(level: ClassLevel): SectionRowValue[] {
  if (level === "MATRIC") return MATRIC_GROUPS.map((group, index) => ({ name: SECTION_LETTERS[index], group }));
  return [{ name: "A", group: "" }];
}

export function presetSubjects(level: ClassLevel): SubjectCellValue[] {
  return (presetFor(level)?.subjects ?? []).map((subject) => ({
    name: subject.name,
    periodsPerWeek: subject.periodsPerWeek,
    group: subject.group ?? "",
  }));
}

export function newClassRow(name: string, level: ClassLevel = levelOfClass(name), custom = false): ClassRowValue {
  return { include: true, name, level, custom, sections: defaultSections(level), subjects: presetSubjects(level) };
}

/** Every preset class, ticked, with its level's sections and subjects. */
export const defaultClassRows = (): ClassRowValue[] =>
  LEVEL_PRESETS.flatMap((preset) => preset.classNames.map((name) => newClassRow(name, preset.key)));

/** Matrix columns: preset subjects first, then any custom ones the admin added. */
export const defaultSubjectNames = (): string[] => [
  ...new Set(LEVEL_PRESETS.flatMap((preset) => preset.subjects.map((subject) => subject.name))),
];

/** "A (Science), B (Arts)" */
export const sectionsText = (sections: SectionRowValue[]) =>
  sections.map((section) => (section.group ? `${section.name} (${section.group})` : section.name)).join(", ");

/** Next section letter after the chosen ones (A–H). */
export function nextLetter(sections: SectionRowValue[]): string | null {
  const used = new Set(sections.map((section) => section.name));
  for (let code = 65; code < 65 + MAX_SECTIONS; code += 1) {
    const letter = String.fromCharCode(code);
    if (!used.has(letter)) return letter;
  }
  return null;
}
