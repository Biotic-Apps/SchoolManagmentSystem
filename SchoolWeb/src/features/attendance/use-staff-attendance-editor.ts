import { useMemo, useState } from "react";
import { OPTIONS_PAGE } from "@/config/options";
import { useStaffList } from "@/features/staff/api";
import { countStatuses } from "./options";
import { useSaveStaffAttendance, useStaffAttendance } from "./staff-attendance-api";
import type { AttendanceStatus, StaffAttendanceEntry } from "./types";

export interface StaffRow extends StaffAttendanceEntry {
  name: string;
}

type Patch = Partial<Pick<StaffAttendanceEntry, "status" | "checkIn" | "checkOut" | "remark">>;

const NO_TIMES = new Set<AttendanceStatus>(["ABSENT", "LEAVE"]);

/**
 * Staff attendance for one branch and day. An unmarked day comes back without entries,
 * so the active staff list becomes the roster. Mount per branch + date (key) to reset edits.
 */
export function useStaffAttendanceEditor(branchId: string, date: string) {
  const query = useStaffAttendance(branchId, date);
  const savedEntries = query.data?.entries;
  const hasSaved = !!savedEntries?.length;
  const staff = useStaffList({ ...OPTIONS_PAGE, branchId, status: "ACTIVE" }, query.isSuccess && !hasSaved);
  const save = useSaveStaffAttendance();
  const [edits, setEdits] = useState<Record<string, Patch>>({});

  const base: StaffRow[] = useMemo(() => {
    if (savedEntries?.length) return savedEntries.map((entry) => ({ ...entry, name: entry.name ?? "Staff member" }));
    return (staff.data?.data ?? []).map((member) => ({
      staffId: member.id,
      name: member.name,
      designation: member.designation,
      photoUrl: member.photoUrl,
      status: null,
      checkIn: null,
      checkOut: null,
      remark: null,
    }));
  }, [savedEntries, staff.data]);

  const rows = base.map((row) => ({ ...row, ...edits[row.staffId] }));

  const update = (staffId: string, patch: Patch) => {
    const next = { ...patch };
    if (patch.status && NO_TIMES.has(patch.status)) Object.assign(next, { checkIn: null, checkOut: null });
    setEdits((current) => ({ ...current, [staffId]: { ...current[staffId], ...next } }));
  };

  const markAllPresent = () => {
    for (const row of rows) if (!row.status) update(row.staffId, { status: "PRESENT" });
  };

  const submit = () =>
    save.mutate(
      {
        branchId,
        date,
        entries: rows
          .filter((row): row is StaffRow & { status: AttendanceStatus } => !!row.status)
          .map((row) => ({
            staffId: row.staffId,
            status: row.status,
            checkIn: row.checkIn ?? undefined,
            checkOut: row.checkOut ?? undefined,
            remark: row.remark?.trim() || undefined,
          })),
      },
      { onSuccess: () => setEdits({}) },
    );

  return {
    query,
    rows,
    loading: query.isLoading || (!hasSaved && staff.isLoading),
    counts: countStatuses(rows.map((row) => row.status)),
    dirty: Object.keys(edits).length > 0,
    update,
    markAllPresent,
    save: submit,
    saving: save.isPending,
  };
}

export type StaffAttendanceEditor = ReturnType<typeof useStaffAttendanceEditor>;
