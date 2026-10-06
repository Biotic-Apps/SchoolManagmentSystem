"use client";

import { NoChildState } from "@/features/auth/components/NoChildState";
import { useActiveChild } from "@/features/auth/use-active-child";
import { useMyLeave } from "../use-my-leave";
import { LeaveRequestsSection } from "./LeaveRequestsSection";
import { StudentLeaveDialog } from "./StudentLeaveDialog";

/** Parent: leave requests for the child picked in the Topbar switcher. */
export function ChildLeavePanel() {
  const child = useActiveChild();
  const leave = useMyLeave({ kind: "STUDENT", subjectId: child?.id }, !!child);

  if (!child) return <NoChildState description="Once the school verifies your link to a child, you can request leave here." />;

  return (
    <LeaveRequestsSection
      leave={leave}
      title="Leave requests"
      description={`Ask the school for leave for ${child.name}. Approved days are marked as leave, not absence.`}
      emptyDescription="Requests you send appear here with the school's decision."
      dialog={
        leave.create.open && <StudentLeaveDialog studentId={child.id} childName={child.name} onClose={leave.create.close} />
      }
    />
  );
}
