"use client";

import type { TeachersCardState } from "../../setup/use-teachers-card";
import type { ClassSubjectItem, OverviewSection } from "../../setup-types";
import { TeacherSelect } from "./TeacherSelect";

interface AllocationCellProps {
  card: TeachersCardState;
  section: OverviewSection;
  subject: ClassSubjectItem;
}

/** Teacher of one subject in one section; blank when the subject is for another group. */
export function AllocationCell({ card, section, subject }: AllocationCellProps) {
  if (!card.applies(section, subject.group)) {
    return <span className="text-caption text-fg-muted" title={`${subject.name} is for the ${subject.group} group`}>—</span>;
  }
  const row = card.cell(section.id, subject.subjectId);
  return (
    <TeacherSelect
      label={`${subject.name} teacher of section ${section.name}`}
      options={card.options}
      value={row?.staff?.id ?? null}
      onSave={(staffId) => card.save(section.id, subject.subjectId, staffId)}
      emptyLabel="No teacher yet"
      readOnly={!card.canEdit}
      readOnlyText={row?.staff?.name}
      flagEmpty
      className="min-w-40"
    />
  );
}
