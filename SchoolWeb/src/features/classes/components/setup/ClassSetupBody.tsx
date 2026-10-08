"use client";

import { useMemo } from "react";
import type { ClassSetupPageState } from "../../setup/use-class-setup-page";
import { teacherOptions } from "../../setup/teacher-options";
import { useSectionsCard } from "../../setup/use-sections-card";
import { useSubjectsCard } from "../../setup/use-subjects-card";
import type { ClassSetup } from "../../setup-types";
import { ClassSetupHeader } from "./ClassSetupHeader";
import { SectionsCard } from "./SectionsCard";
import { SubjectsCard } from "./SubjectsCard";
import { TeachersCard } from "./TeachersCard";

interface ClassSetupBodyProps {
  page: ClassSetupPageState;
  setup: ClassSetup;
}

export function ClassSetupBody({ page, setup }: ClassSetupBodyProps) {
  const branchId = page.branchId ?? "";
  const sections = useSectionsCard(setup, branchId, page.sessionId);
  const subjects = useSubjectsCard(setup, page.schoolId, page.bell);

  // Teachers already working in this class are offered first.
  const preferred = useMemo(() => {
    const ids = new Set<string>();
    for (const row of setup.allocation) if (row.staff) ids.add(row.staff.id);
    for (const section of setup.sections) if (section.classTeacher) ids.add(section.classTeacher.id);
    return ids;
  }, [setup]);
  const options = useMemo(() => teacherOptions(page.staff, preferred), [page.staff, preferred]);
  const sessionName = page.scope.sessions.options.find((option) => option.id === page.sessionId)?.name ?? null;

  return (
    <div className="flex flex-col gap-4">
      <ClassSetupHeader page={page} setup={setup} />
      <SectionsCard card={sections} teacherOptions={options} sessionName={sessionName} />
      <SubjectsCard card={subjects} />
      <TeachersCard setup={setup} branchId={branchId} sessionId={page.sessionId} staff={page.staff} preferred={preferred} />
    </div>
  );
}
