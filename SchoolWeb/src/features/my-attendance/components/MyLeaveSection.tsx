"use client";

import { LeaveRequestsSection } from "@/features/attendance/components/LeaveRequestsSection";
import { useMyLeave } from "@/features/attendance/use-my-leave";
import { StaffLeaveDialog } from "./StaffLeaveDialog";

export function MyLeaveSection() {
  const leave = useMyLeave({ kind: "STAFF" });
  return (
    <LeaveRequestsSection
      leave={leave}
      title="My leave"
      description="Casual, sick, annual or unpaid leave. Requests stay open until the principal decides."
      withType
      emptyDescription="Leave you request appears here with the decision."
      dialog={leave.create.open && <StaffLeaveDialog onClose={leave.create.close} />}
    />
  );
}
