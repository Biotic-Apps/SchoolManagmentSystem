import { blankToUndefined } from "@/lib/validation";
import type { SetupFormValues } from "./schemas";
import type { SchoolSetupInput, SetupBellInput, SetupClassInput } from "./types";

type Academics = SetupFormValues["academics"];

/** Included classes; a subject group that no section of the class has is dropped (the subject then goes to every section). */
function classesInput(rows: Academics["classes"]): SetupClassInput[] {
  return rows
    .filter((row) => row.include)
    .map((row) => {
      const groups = new Set(row.sections.map((section) => section.group).filter(Boolean));
      return {
        name: row.name.trim(),
        level: row.level,
        sections: row.sections.map((section) => ({ name: section.name, ...(section.group ? { group: section.group } : {}) })),
        subjects: row.subjects.map((subject) => ({
          name: subject.name,
          periodsPerWeek: subject.periodsPerWeek,
          ...(subject.group && groups.has(subject.group) ? { group: subject.group } : {}),
        })),
      };
    });
}

function bellInput(bell: SetupFormValues["bell"], workingDays: number[]): SetupBellInput {
  const { shortFriday, friday, ...rest } = bell;
  // The Friday variant only matters when Friday is a working day.
  return shortFriday && workingDays.includes(5) ? { ...rest, friday } : rest;
}

function academicsInput(values: SetupFormValues): SchoolSetupInput["academics"] {
  const { academics } = values;
  if (!academics.createSession) return { createSession: false };
  return {
    createSession: true,
    sessionName: academics.sessionName.trim(),
    startDate: academics.startDate,
    endDate: academics.endDate,
    classes: classesInput(academics.classes),
    bellSchedule: bellInput(values.bell, values.branch.workingDays),
  };
}

export function toSetupInput(values: SetupFormValues): SchoolSetupInput {
  const { school, branch, principal } = values;
  return {
    school: {
      code: school.code,
      name: school.name.trim(),
      phone: blankToUndefined(school.phone),
      email: blankToUndefined(school.email),
      website: blankToUndefined(school.website),
      address: blankToUndefined(school.address),
    },
    branch: {
      name: branch.name.trim(),
      code: branch.code,
      phone: blankToUndefined(branch.phone),
      email: blankToUndefined(branch.email),
      address: blankToUndefined(branch.address),
      timings: { opensAt: branch.opensAt, closesAt: branch.closesAt, attendanceLockAt: branch.attendanceLockAt },
      workingDays: branch.workingDays,
    },
    principal: {
      name: principal.name.trim(),
      email: blankToUndefined(principal.email),
      phone: blankToUndefined(principal.phone),
      password: principal.generatePassword ? undefined : principal.password,
    },
    academics: academicsInput(values),
  };
}

/**
 * Older APIs reject `academics.classes` / `bellSchedule` ("should not exist"). This keeps the same
 * school creatable there: ticked class names, the most sections any class has (1–4), all subjects.
 */
export function toLegacySetupInput(values: SetupFormValues): SchoolSetupInput {
  const input = toSetupInput(values);
  const { academics } = values;
  if (!academics.createSession) return input;
  const included = academics.classes.filter((row) => row.include);
  const sections = Math.min(4, Math.max(1, ...included.map((row) => row.sections.length)));
  const subjects = [...new Set(included.flatMap((row) => row.subjects.map((subject) => subject.name)))];
  const rest = { ...input.academics };
  delete rest.classes;
  delete rest.bellSchedule;
  return {
    ...input,
    academics: {
      ...rest,
      classesPreset: included.length ? "STANDARD" : "NONE",
      classNames: included.map((row) => row.name.trim()),
      sectionsPerClass: sections,
      subjectsPreset: subjects.length ? "STANDARD" : "NONE",
      subjectNames: subjects,
    },
  };
}
