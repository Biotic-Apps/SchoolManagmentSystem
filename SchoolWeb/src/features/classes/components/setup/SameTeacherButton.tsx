"use client";

import { CopyCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { TeachersCardState } from "../../setup/use-teachers-card";
import type { ClassSubjectItem } from "../../setup-types";

/** "Same for all": copies the first chosen teacher to every section of the subject. */
export function SameTeacherButton({ card, subject }: { card: TeachersCardState; subject: ClassSubjectItem }) {
  const targets = card.sections.filter((section) => card.applies(section, subject.group));
  const hasSource = targets.some((section) => card.cell(section.id, subject.subjectId)?.staff);
  if (!card.canEdit || targets.length < 2) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={!hasSource}
      loading={card.filling === subject.subjectId}
      onClick={() => void card.sameForAll(subject.subjectId, subject.group)}
      title={hasSource ? "Use this teacher in every section" : "Pick a teacher in one section first"}
    >
      <CopyCheck />
      Same for all
    </Button>
  );
}
