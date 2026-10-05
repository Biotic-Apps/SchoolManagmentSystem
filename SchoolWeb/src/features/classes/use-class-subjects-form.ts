import { useState, type FormEvent } from "react";
import { OPTIONS_PAGE } from "@/config/options";
import { useClassSubjects, useSaveClassSubjects } from "./api";
import { useSubjects } from "./subjects-api";
import type { SchoolClass } from "./types";

/** Checkbox selection of the school's subjects for one class; starts from the saved mapping. */
export function useClassSubjectsForm(item: SchoolClass, onDone: () => void) {
  const assigned = useClassSubjects(item.id);
  const all = useSubjects({ ...OPTIONS_PAGE, schoolId: item.schoolId });
  const save = useSaveClassSubjects(item.id);
  const [picked, setPicked] = useState<string[] | null>(null);

  const selected = picked ?? assigned.data?.map((subject) => subject.id) ?? [];
  const loading = assigned.isLoading || all.isLoading;
  const error = assigned.error ?? all.error;

  const toggle = (id: string, checked: boolean) =>
    setPicked(checked ? [...selected, id] : selected.filter((current) => current !== id));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    // Never overwrite the saved mapping before it has loaded.
    if (loading || error || !assigned.data) return;
    save.mutate(selected, { onSuccess: onDone });
  };

  return {
    subjects: all.data?.data ?? [],
    selected: new Set(selected),
    toggle,
    loading,
    error,
    retry: () => Promise.all([assigned.refetch(), all.refetch()]),
    submit,
    submitting: save.isPending,
  };
}
