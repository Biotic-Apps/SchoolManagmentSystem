"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { SessionsCalendarPanel } from "./SessionsCalendarPanel";

export function SessionsPage() {
  return (
    <>
      <PageHeader
        title="Sessions & Calendar"
        description="Academic sessions and terms for each branch, plus holidays, vacations and key dates."
      />
      <SessionsCalendarPanel />
    </>
  );
}
