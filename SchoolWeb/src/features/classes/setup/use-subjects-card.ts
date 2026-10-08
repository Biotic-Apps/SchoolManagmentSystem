import { useMemo, useRef, useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { hasErrorCode } from "@/lib/api-error";
import { errorMessage, errorWithDetails } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { OPTIONS_PAGE } from "@/config/options";
import type { BellSchedule } from "@/features/timetable/builder-types";
import { presetFor, type ClassLevel } from "../level-presets";
import { useCreateLinkedSubject, useSetClassSubjects } from "../setup-api";
import type { ClassSetup, ClassSubjectItem } from "../setup-types";
import { useSubjects } from "../subjects-api";
import type { Subject } from "../types";
import { plannedByGroup, teachingPeriodsPerWeek } from "./planned-periods";

const SAVE_DELAY_MS = 500;

const toInputs = (items: ClassSubjectItem[]) =>
  items.map(({ subjectId, periodsPerWeek, isOptional, group }) => ({ subjectId, periodsPerWeek, isOptional, group }));

const fromSubject = (subject: Subject, extra: Partial<ClassSubjectItem> = {}): ClassSubjectItem => ({
  subjectId: subject.id,
  code: subject.code,
  name: subject.name,
  periodsPerWeek: null,
  isOptional: false,
  group: null,
  sortOrder: 0,
  ...extra,
});

export interface RowError {
  subjectId: string;
  message: string;
}

/**
 * The class's curriculum, edited in place and saved (debounced) as one ordered list.
 * Removing a subject that lessons or teachers still use comes back with the server's reason.
 */
export function useSubjectsCard(setup: ClassSetup, schoolId: string | null, bell: BellSchedule | null) {
  const classId = setup.class.id;
  const save = useSetClassSubjects(classId);
  const create = useCreateLinkedSubject(classId);
  const school = useSubjects({ ...OPTIONS_PAGE, schoolId }, !!schoolId);
  const [draft, setDraft] = useState<ClassSubjectItem[] | null>(null);
  const [rowError, setRowError] = useState<RowError | null>(null);
  const [applying, setApplying] = useState(false);
  const latest = useRef<ClassSubjectItem[] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = draft ?? setup.subjects;

  const flush = async (next: ClassSubjectItem[]) => {
    const removed = setup.subjects.filter((item) => !next.some((kept) => kept.subjectId === item.subjectId));
    try {
      await save.mutateAsync(toInputs(next));
      if (latest.current === next) {
        latest.current = null;
        setDraft(null);
      }
    } catch (error) {
      latest.current = null;
      setDraft(null);
      if (hasErrorCode(error, "SUBJECT_IN_USE") && removed[0]) {
        setRowError({ subjectId: removed[0].subjectId, message: errorWithDetails(error) });
      } else {
        toast.error(errorMessage(error));
      }
    }
  };

  const commit = (next: ClassSubjectItem[]) => {
    latest.current = next;
    setDraft(next);
    setRowError(null);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(next), SAVE_DELAY_MS);
  };

  const update = (subjectId: string, patch: Partial<ClassSubjectItem>) =>
    commit(items.map((item) => (item.subjectId === subjectId ? { ...item, ...patch } : item)));

  const schoolSubjects = school.data?.data ?? [];
  const addable: Option[] = useMemo(
    () =>
      (school.data?.data ?? [])
        .filter((subject) => !items.some((item) => item.subjectId === subject.id))
        .map((subject) => ({ id: subject.id, name: subject.name })),
    [school.data, items],
  );

  const findSchoolSubject = (name: string) => schoolSubjects.find((subject) => subject.name.toLowerCase() === name.toLowerCase());

  const createSubject = async (name: string, classIds: string[]) =>
    create.mutateAsync({ schoolId: schoolId ?? "", name, classIds });

  const total = teachingPeriodsPerWeek(bell);

  return {
    items,
    canEdit: setup.canEditStructure,
    groups: setup.groups,
    rowError,
    addable,
    planned: plannedByGroup(items, setup.groups),
    totalPeriods: total,
    applying,
    setPeriods: (subjectId: string, periodsPerWeek: number | null) => update(subjectId, { periodsPerWeek }),
    setGroup: (subjectId: string, group: string | null) => update(subjectId, { group }),
    setOptional: (subjectId: string, isOptional: boolean) => update(subjectId, { isOptional }),
    move: (from: number, to: number) => {
      if (to < 0 || to >= items.length) return;
      const next = [...items];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      commit(next);
    },
    remove: (subjectId: string) => commit(items.filter((item) => item.subjectId !== subjectId)),
    add: (option: Option) => {
      const subject = schoolSubjects.find((item) => item.id === option.id);
      if (subject) commit([...items, fromSubject(subject)]);
    },
    /** Creates a school subject and links it here; a pending edit keeps the new link. */
    createNew: async (name: string) => {
      try {
        const created = await createSubject(name, [classId]);
        if (latest.current) commit([...latest.current, fromSubject(created)]);
      } catch {
        // toasted by the mutation
      }
    },
    /** Adds the level's preset subjects that are missing, creating school subjects as needed. */
    applyPreset: async (level: ClassLevel) => {
      const preset = presetFor(level);
      if (!preset) return;
      setApplying(true);
      try {
        const added: ClassSubjectItem[] = [];
        for (const entry of preset.subjects) {
          if (items.some((item) => item.name.toLowerCase() === entry.name.toLowerCase())) continue;
          const subject = findSchoolSubject(entry.name) ?? (await createSubject(entry.name, []));
          const group = entry.group && setup.groups.includes(entry.group) ? entry.group : null;
          added.push(fromSubject(subject, { periodsPerWeek: entry.periodsPerWeek, isOptional: !!entry.isOptional, group }));
        }
        if (added.length) commit([...items, ...added]);
        else toast.info(`All ${preset.label} subjects are already in this class`);
      } catch {
        // toasted by the mutation
      } finally {
        setApplying(false);
      }
    },
  };
}

export type SubjectsCardState = ReturnType<typeof useSubjectsCard>;
