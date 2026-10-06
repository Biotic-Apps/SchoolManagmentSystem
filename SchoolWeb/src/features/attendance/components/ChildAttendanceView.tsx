"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { NoChildState } from "@/features/auth/components/NoChildState";
import { useActiveChild } from "@/features/auth/use-active-child";
import { ChildLeavePanel } from "./ChildLeavePanel";
import { StudentAttendanceTab } from "./StudentAttendanceTab";

/** Parent: attendance and leave of the child picked in the Topbar switcher. */
export function ChildAttendanceView() {
  const child = useActiveChild();
  const caption = child ? [child.name, child.className, child.sectionName].filter(Boolean).join(" · ") : undefined;

  return (
    <>
      <PageHeader title="Attendance" description={caption} />
      {!child ? (
        <NoChildState description="Once the school verifies your link to a child, their attendance and leave appear here." />
      ) : (
        <>
          <StudentAttendanceTab key={child.id} studentId={child.id} />
          <ChildLeavePanel />
        </>
      )}
    </>
  );
}
