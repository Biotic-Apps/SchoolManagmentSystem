import { blankToUndefined } from "@/lib/validation";
import { STANDARD_CLASSES, STANDARD_SUBJECTS } from "./presets";
import type { SetupFormValues } from "./schemas";
import type { Preset, SchoolSetupInput } from "./types";

/** STANDARD when every preset entry is ticked, NONE when none are; otherwise the ticked names. */
function presetChoice(selected: string[], all: string[]): { preset: Preset; names?: string[] } {
  if (selected.length === 0) return { preset: "NONE" };
  if (selected.length === all.length) return { preset: "STANDARD" };
  return { preset: "STANDARD", names: all.filter((name) => selected.includes(name)) };
}

function academicsInput(values: SetupFormValues["academics"]): SchoolSetupInput["academics"] {
  if (!values.createSession) return { createSession: false };
  const classes = presetChoice(values.classes, STANDARD_CLASSES);
  const subjects = presetChoice(values.subjects, STANDARD_SUBJECTS);
  return {
    createSession: true,
    sessionName: values.sessionName.trim(),
    startDate: values.startDate,
    endDate: values.endDate,
    classesPreset: classes.preset,
    sectionsPerClass: Number(values.sectionsPerClass),
    subjectsPreset: subjects.preset,
    ...(classes.names ? { classNames: classes.names } : {}),
    ...(subjects.names ? { subjectNames: subjects.names } : {}),
  };
}

export function toSetupInput(values: SetupFormValues): SchoolSetupInput {
  const { school, branch, principal, academics } = values;
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
    academics: academicsInput(academics),
  };
}
