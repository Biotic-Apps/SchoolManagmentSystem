"use client";

import { Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { UnlinkDialog } from "@/features/guardians/components/UnlinkDialog";
import { useModuleAccess } from "@/features/modules/use-module-access";
import type { StudentDetail } from "../types";
import { useStudentGuardians } from "../use-student-guardians";
import { AddGuardianDialog } from "./AddGuardianDialog";
import { GuardianLinkCard } from "./GuardianLinkCard";

export function StudentGuardiansTab({ student, readOnly = false }: { student: StudentDetail; readOnly?: boolean }) {
  const tab = useStudentGuardians(student, readOnly);
  const guardiansScreen = useModuleAccess("guardians").allowed;

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading
        title="Parents and guardians"
        actions={
          tab.canAdd && (
            <Button variant="secondary" size="sm" onClick={() => tab.add.show(true)}>
              <Plus />
              Add guardian
            </Button>
          )
        }
      />
      {tab.links.length === 0 ? (
        <EmptyState title="No guardians linked" />
      ) : (
        <ul className="flex flex-col gap-3">
          {tab.links.map((link) => (
            <GuardianLinkCard
              key={link.id}
              link={link}
              linkName={!readOnly && guardiansScreen}
              child={{ name: student.name, admissionNo: student.admissionNo }}
              onRemove={tab.onRemove}
            />
          ))}
        </ul>
      )}
      {tab.add.open && <AddGuardianDialog student={student} onClose={tab.add.close} />}
      <UnlinkDialog unlink={tab.unlink} />
    </section>
  );
}
