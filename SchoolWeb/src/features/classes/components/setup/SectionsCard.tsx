"use client";

import type { CSSProperties } from "react";
import { DoorOpen, Plus, Split } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormPanel } from "@/components/shared/FormPanel";
import type { HintedOption } from "@/components/shared/select-option";
import { Button } from "@/components/ui/Button";
import type { SectionsCardState } from "../../setup/use-sections-card";
import { SectionRow } from "./SectionRow";
import { SetupGridHeader } from "./SetupGridHeader";

interface SectionsCardProps {
  card: SectionsCardState;
  teacherOptions: HintedOption[];
  sessionName: string | null;
}

// Columns that are empty for every section (no groups, no rooms) are left out.
function columns(card: SectionsCardState) {
  const list: [string, string][] = [["Section", "3.5rem"]];
  if (card.showGroups) list.push(["Group", "minmax(8rem,10rem)"]);
  list.push(["Seats", "8.5rem"]);
  if (card.showRooms) list.push(["Room", "minmax(9rem,12rem)"]);
  list.push(["Class teacher", "minmax(12rem,1fr)"], ["Students", "4.5rem"]);
  if (card.canEdit) list.push(["", "2.5rem"]);
  return { titles: list.map(([title]) => title), template: list.map(([, size]) => size).join(" ") };
}

const ROW =
  "grid grid-cols-2 items-center gap-3 rounded-input border border-border p-3 " +
  "md:rounded-none md:border-0 md:border-b md:px-1 md:py-2 md:[grid-template-columns:var(--cols)] md:last:border-b-0";

export function SectionsCard({ card, teacherOptions, sessionName }: SectionsCardProps) {
  const { titles, template } = columns(card);
  const style = { "--cols": template } as CSSProperties;

  return (
    <FormPanel
      id="sections"
      title="Sections"
      description={`Sections of this class${sessionName ? ` in ${sessionName}` : ""}. Each has its own seats, room and class teacher.`}
      actions={
        card.canEdit && (!card.showGroups || !card.showRooms) ? (
          <div className="flex flex-wrap gap-1">
            {!card.showGroups && (
              <Button variant="ghost" size="sm" onClick={card.revealGroups}>
                <Split />
                Use groups
              </Button>
            )}
            {!card.showRooms && (
              <Button variant="ghost" size="sm" onClick={card.revealRooms}>
                <DoorOpen />
                Add rooms
              </Button>
            )}
          </div>
        ) : undefined
      }
    >
      {card.sections.length === 0 ? (
        <p className="text-label text-fg-muted">No sections yet. Add section A to start.</p>
      ) : (
        <div style={style}>
          <SetupGridHeader titles={titles} style={style} />
          <ul className="flex flex-col gap-2 md:gap-0">
            {card.sections.map((section) => (
              <SectionRow key={section.id} section={section} card={card} teacherOptions={teacherOptions} className={ROW} />
            ))}
          </ul>
        </div>
      )}
      {card.canEdit && (
        <Button variant="secondary" className="self-start" onClick={card.addSection} loading={card.adding}>
          <Plus />
          Add section
        </Button>
      )}
      <ConfirmDialog
        open={card.removeDialog.open}
        onOpenChange={card.removeDialog.onOpenChange}
        title={`Remove section ${card.removeDialog.item?.name ?? ""}?`}
        description="Its teacher assignments end and its draft timetable is deleted. A section with enrolled students can't be removed."
        confirmLabel="Remove section"
        tone="danger"
        loading={card.removing}
        error={card.removeError}
        onConfirm={() => void card.confirmRemove()}
      />
    </FormPanel>
  );
}
