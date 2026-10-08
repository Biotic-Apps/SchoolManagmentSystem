import { invalid } from '../../../core/common/errors/errors';
import {
  normalizeGroup,
  sameGroup,
} from '../../academics/curriculum/curriculum';
import { uniqueCode } from '../../academics/curriculum/subject-codes';
import type { SetupClassInput } from '../dto/setup-classes.input';
import { CLASS_PRESETS, SUBJECT_PRESETS, sectionNames } from '../presets';
import type { ClassesPreset, SubjectsPreset } from '../presets';

export interface PlannedSubject {
  code: string;
  name: string;
  periodsPerWeek: number | null;
  group: string | null;
  isOptional: boolean;
}

export interface PlannedClass {
  name: string;
  levelOrder: number;
  sections: { name: string; group: string | null }[];
  subjects: PlannedSubject[];
}

/** Classes with their sections and curriculum, plus the school's subject list. */
export interface CurriculumPlan {
  classes: PlannedClass[];
  subjects: { code: string; name: string }[];
}

export interface LegacyPick {
  classesPreset: ClassesPreset;
  sectionsPerClass: number;
  subjectsPreset: SubjectsPreset;
  classNames?: readonly string[];
  subjectNames?: readonly string[];
}

export const MAX_SETUP_CLASSES = 30;

const fail = (message: string) => invalid(message, [message]);
const lower = (s: string) => s.trim().toLowerCase();

function assertUnique(names: string[], field: string, what: string) {
  const seen = new Set<string>();
  for (const name of names) {
    if (seen.has(lower(name)))
      throw fail(`${field} has ${what} "${name.trim()}" twice`);
    seen.add(lower(name));
  }
}

/** `academics.classes` (contract §5.1): validated, codes assigned, shared subjects merged. */
export function planFromClasses(input: SetupClassInput[]): CurriculumPlan {
  if (input.length > MAX_SETUP_CLASSES)
    throw fail(`academics.classes has more than ${MAX_SETUP_CLASSES} classes`);
  assertUnique(
    input.map((c) => c.name),
    'academics.classes',
    'class',
  );
  const codes = new Map<string, string>();
  const taken = new Set<string>();
  const subjects: { code: string; name: string }[] = [];
  const codeOf = (name: string) => {
    const key = lower(name);
    if (!codes.has(key)) {
      const code = uniqueCode(name, taken);
      codes.set(key, code);
      subjects.push({ code, name: name.trim() });
    }
    return codes.get(key)!;
  };

  const classes = input.map((c, i): PlannedClass => {
    const field = `academics.classes.${i}`;
    assertUnique(
      c.sections.map((s) => s.name),
      `${field}.sections`,
      'section',
    );
    const items = c.subjects ?? [];
    assertUnique(
      items.map((s) => s.name),
      `${field}.subjects`,
      'subject',
    );
    const sections = c.sections.map((s) => ({
      name: s.name.trim(),
      group: normalizeGroup(s.group),
    }));
    return {
      name: c.name.trim(),
      levelOrder: i + 1,
      sections,
      subjects: items.map((s, j) => {
        const group = normalizeGroup(s.group);
        if (group && !sections.some((x) => sameGroup(x.group, group)))
          throw fail(
            `${field}.subjects.${j}.group "${group}" matches no section group of ${c.name.trim()}`,
          );
        return {
          code: codeOf(s.name),
          name: s.name.trim(),
          periodsPerWeek: s.periodsPerWeek ?? null,
          group,
          isOptional: s.isOptional ?? false,
        };
      }),
    };
  });
  return { classes, subjects };
}

/** Legacy fields: preset classes × same sections; now every subject is linked to every class. */
export function planFromLegacy(pick: LegacyPick): CurriculumPlan {
  const allClasses = pick.classNames
    ? CLASS_PRESETS.STANDARD
    : CLASS_PRESETS[pick.classesPreset];
  const subjects = (
    pick.subjectNames
      ? SUBJECT_PRESETS.STANDARD.filter((s) =>
          pick.subjectNames!.includes(s.name),
        )
      : SUBJECT_PRESETS[pick.subjectsPreset]
  ).map((s) => ({ code: s.code, name: s.name }));
  const classes = allClasses
    .map((name, i) => ({ name, levelOrder: i + 1 }))
    .filter((c) => !pick.classNames || pick.classNames.includes(c.name))
    .map((c) => ({
      ...c,
      sections: sectionNames(pick.sectionsPerClass).map((name) => ({
        name,
        group: null,
      })),
      subjects: subjects.map((s) => ({
        ...s,
        periodsPerWeek: null,
        group: null,
        isOptional: false,
      })),
    }));
  return { classes, subjects };
}
