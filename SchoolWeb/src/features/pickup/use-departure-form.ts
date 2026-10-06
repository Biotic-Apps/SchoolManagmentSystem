import { useEffect, useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import type { Option } from "@/components/shared/OptionSelect";
import { useStudent } from "@/features/students/api";
import { hasErrorCode } from "@/lib/api-error";
import { formatTime } from "@/lib/time";
import { useServerForm } from "@/lib/use-server-form";
import { useEarlyLeaves, usePickupPersons, useRecordDeparture } from "./api";
import { nowTime } from "./now-time";
import { pickupChoices } from "./pickup-choices";
import { departureDefaults, departureSchema, toDepartureInput, type DepartureValues } from "./schemas";

const BLOCKED = "BLOCKED" as const;

/** Gate departure: pick the student, then who is collecting them; unverified pickers are refused by the API. */
export function useDepartureForm(branchId: string, date: string, onDone: () => void) {
  const record = useRecordDeparture();
  const [blockedFor, setBlockedFor] = useState<string | null>(null);

  const server = useServerForm<DepartureValues, unknown>({
    schema: departureSchema,
    defaultValues: departureDefaults(nowTime()),
    onSubmit: async (values) => {
      try {
        return await record.mutateAsync(toDepartureInput(values, date));
      } catch (error) {
        if (!hasErrorCode(error, "PICKUP_NOT_AUTHORIZED")) throw error;
        setBlockedFor(`${values.studentId}|${values.picker}`);
        return BLOCKED;
      }
    },
    onSuccess: (result) => result !== BLOCKED && onDone(),
  });

  const { control, setValue } = server.form;
  const studentId = useWatch({ control, name: "studentId" });
  const picker = useWatch({ control, name: "picker" });
  const customTime = useWatch({ control, name: "customTime" });

  // A new student means a new set of pickers and early-leave requests.
  useEffect(() => {
    setValue("picker", "");
    setValue("earlyLeaveId", "");
  }, [studentId, setValue]);

  const student = useStudent(studentId || null);
  const persons = usePickupPersons(studentId || null);
  const earlyLeaves = useEarlyLeaves({ branchId, date, status: "APPROVED", studentId }, !!studentId);

  const choices = useMemo(
    () => pickupChoices(student.data?.guardians ?? [], persons.data ?? []),
    [student.data, persons.data],
  );
  const earlyLeaveOptions: Option[] = useMemo(
    () =>
      (earlyLeaves.data ?? [])
        .filter((item) => item.student.id === studentId && item.status === "APPROVED")
        .map((item) => ({ id: item.id, name: `${formatTime(item.time)} · ${item.reason}` })),
    [earlyLeaves.data, studentId],
  );

  return {
    ...server,
    studentId,
    customTime,
    choices,
    choicesLoading: !!studentId && (student.isLoading || persons.isLoading),
    choicesError: student.error ?? persons.error,
    earlyLeaveOptions,
    blocked: !!blockedFor && blockedFor === `${studentId}|${picker}`,
  };
}
