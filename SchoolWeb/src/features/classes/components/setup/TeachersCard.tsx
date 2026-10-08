"use client";

import { UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { FormPanel } from "@/components/shared/FormPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AddStaffDialog } from "@/features/staff/components/AddStaffDialog";
import { useTeachersCard } from "../../setup/use-teachers-card";
import type { ClassSetup, TeachingStaff } from "../../setup-types";
import { AllocationCell } from "./AllocationCell";
import { SameTeacherButton } from "./SameTeacherButton";

interface TeachersCardProps {
  setup: ClassSetup;
  branchId: string;
  sessionId: string | null;
  staff: TeachingStaff[];
  preferred: Set<string>;
}

/** Who teaches each subject in each section: rows = subjects, columns = sections (cards on phones). */
export function TeachersCard({ setup, branchId, staff, preferred }: TeachersCardProps) {
  const card = useTeachersCard(setup, staff, preferred);
  const queryClient = useQueryClient();
  const empty = card.sections.length === 0 || card.subjects.length === 0;

  return (
    <FormPanel
      id="teachers"
      title="Teachers"
      description="Pick who teaches each subject in each section. The list shows each teacher's load (placed / allocated periods)."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {!empty && (
            <Badge tone={card.left ? "warning" : "success"}>{card.left ? `${card.left} left to assign` : "All assigned"}</Badge>
          )}
          {card.canEdit && (
            <Button variant="ghost" size="sm" onClick={() => card.addStaff.show(true)}>
              <UserPlus />
              Add teacher
            </Button>
          )}
        </div>
      }
    >
      {empty ? (
        <p className="text-label text-fg-muted">Add sections and subjects above first; then pick their teachers here.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-label">
              <thead>
                <tr className="border-b border-border text-left text-caption font-semibold text-fg-muted">
                  <th scope="col" className="py-2 pr-3">
                    Subject
                  </th>
                  {card.sections.map((section) => (
                    <th key={section.id} scope="col" className="px-2 py-2">
                      Section {section.name}
                      {section.group && <span className="font-normal"> · {section.group}</span>}
                    </th>
                  ))}
                  <th scope="col" className="w-32 py-2">
                    <span className="sr-only">Quick actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {card.subjects.map((subject) => (
                  <tr key={subject.subjectId} className="border-b border-border last:border-b-0">
                    <th scope="row" className="py-2 pr-3 text-left font-medium text-fg">
                      {subject.name}
                      {subject.periodsPerWeek != null && (
                        <span className="block text-caption font-normal text-fg-muted">{subject.periodsPerWeek} periods / week</span>
                      )}
                    </th>
                    {card.sections.map((section) => (
                      <td key={section.id} className="px-2 py-2">
                        <AllocationCell card={card} section={section} subject={subject} />
                      </td>
                    ))}
                    <td className="py-2 text-right">
                      <SameTeacherButton card={card} subject={subject} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-col gap-3 md:hidden">
            {card.subjects.map((subject) => (
              <li key={subject.subjectId} className="flex flex-col gap-2 rounded-input border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-fg">{subject.name}</span>
                  <SameTeacherButton card={card} subject={subject} />
                </div>
                {card.sections.map((section) => (
                  <div key={section.id} className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
                    <span className="text-caption font-medium text-fg-muted">Section {section.name}</span>
                    <AllocationCell card={card} section={section} subject={subject} />
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </>
      )}
      {card.addStaff.open && (
        <AddStaffDialog
          branchId={branchId}
          onClose={card.addStaff.close}
          onCreated={() => {
            card.addStaff.close();
            void queryClient.invalidateQueries({ queryKey: ["teaching-staff"] });
          }}
        />
      )}
    </FormPanel>
  );
}
