"use client";

import { useState } from "react";
import { DateStepper } from "@/components/shared/DateStepper";
import { Skeleton } from "@/components/ui/Skeleton";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { todayIso } from "@/lib/dates";
import { StaffAttendancePanel } from "./StaffAttendancePanel";

export function StaffAttendanceTab() {
  const picker = useBranchPicker();
  const [date, setDate] = useState(todayIso());

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <BranchPickerSelect picker={picker} className="md:w-56" />
        <DateStepper value={date} onChange={setDate} max={todayIso()} />
      </div>
      {picker.isLoading && <Skeleton className="h-64 w-full" />}
      {picker.branchId && (
        <StaffAttendancePanel key={`${picker.branchId}:${date}`} branchId={picker.branchId} date={date} />
      )}
    </div>
  );
}
