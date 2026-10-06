import { useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useSaveParticipants } from "./api";
import type { ConsentRow, Participant } from "./types";

export interface ParticipantRow {
  studentId: string;
  name: string;
  role: string;
  result: string;
  position: string;
  remarks: string;
}

type EditableField = "role" | "result" | "position" | "remarks";

const toRow = (item: Participant, nameOf: (id: string) => string | undefined): ParticipantRow => ({
  studentId: item.studentId,
  name: item.name ?? nameOf(item.studentId) ?? "Student",
  role: item.role ?? "",
  result: item.result ?? "",
  position: item.position ? String(item.position) : "",
  remarks: item.remarks ?? "",
});

const orNull = (value: string) => value.trim() || null;

/** Local participant rows (role, result, position, remarks) saved in one PUT. */
export function useParticipantsEditor(activityId: string, initial: Participant[], consents: ConsentRow[]) {
  const nameOf = (id: string) => consents.find((row) => row.student.id === id)?.student.name;
  const [rows, setRows] = useState<ParticipantRow[]>(() => initial.map((item) => toRow(item, nameOf)));
  const [dirty, setDirty] = useState(false);
  const save = useSaveParticipants(activityId);
  const taken = new Set(rows.map((row) => row.studentId));

  const grantedOptions: Option[] = consents
    .filter((row) => row.status === "GRANTED" && !taken.has(row.student.id))
    .map((row) => ({ id: row.student.id, name: row.student.name }));

  const update = (next: ParticipantRow[]) => {
    setRows(next);
    setDirty(true);
  };

  return {
    rows,
    dirty,
    saving: save.isPending,
    grantedOptions,
    has: (studentId: string) => taken.has(studentId),
    add: (studentId: string, name: string) =>
      !taken.has(studentId) &&
      update([...rows, { studentId, name, role: "", result: "", position: "", remarks: "" }]),
    remove: (studentId: string) => update(rows.filter((row) => row.studentId !== studentId)),
    setField: (studentId: string, field: EditableField, value: string) =>
      update(rows.map((row) => (row.studentId === studentId ? { ...row, [field]: value } : row))),
    save: () =>
      save.mutate(
        rows.map((row) => ({
          studentId: row.studentId,
          role: orNull(row.role),
          result: orNull(row.result),
          position: /^\d+$/.test(row.position.trim()) ? Number(row.position) : null,
          remarks: orNull(row.remarks),
        })),
        { onSuccess: () => setDirty(false) },
      ),
  };
}

export type ParticipantsEditor = ReturnType<typeof useParticipantsEditor>;
