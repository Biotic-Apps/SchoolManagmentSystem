"use client";

import type { CSSProperties } from "react";
import { CreatableCombobox } from "@/components/shared/CreatableCombobox";
import { FormPanel } from "@/components/shared/FormPanel";
import type { SubjectsCardState } from "../../setup/use-subjects-card";
import { PlannedPeriods } from "./PlannedPeriods";
import { PresetMenu } from "./PresetMenu";
import { SetupGridHeader } from "./SetupGridHeader";
import { SubjectRow } from "./SubjectRow";

function columns(card: SubjectsCardState) {
  const list: [string, string][] = [["Subject", "minmax(9rem,1fr)"], ["Periods / week", "8.5rem"]];
  if (card.groups.length > 0) list.push(["Taught to", "minmax(9rem,11rem)"]);
  list.push(["", "6.5rem"], ["", card.canEdit ? "7.5rem" : "0"]);
  return { titles: list.map(([title]) => title), template: list.map(([, size]) => size).join(" ") };
}

const ROW =
  "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-input border border-border p-3 md:grid " +
  "md:rounded-none md:border-0 md:border-b md:px-1 md:py-1.5 md:[grid-template-columns:var(--cols)] md:last:border-b-0";

export function SubjectsCard({ card }: { card: SubjectsCardState }) {
  const { titles, template } = columns(card);
  const style = { "--cols": template } as CSSProperties;

  return (
    <FormPanel
      id="subjects"
      title="Subjects"
      description="What this class studies and how many periods a week each needs. The timetable uses these counts as a guide."
      actions={card.canEdit ? <PresetMenu onApply={(level) => void card.applyPreset(level)} loading={card.applying} /> : undefined}
    >
      {card.items.length === 0 ? (
        <p className="text-label text-fg-muted">
          No subjects yet. {card.canEdit ? "Apply a preset or add them one by one below." : ""}
        </p>
      ) : (
        <div style={style}>
          <SetupGridHeader titles={titles} style={style} />
          <ul className="flex flex-col gap-2 md:gap-0">
            {card.items.map((item, index) => (
              <SubjectRow key={item.subjectId} item={item} index={index} card={card} className={ROW} />
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-col gap-3 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
        {card.canEdit && (
          <CreatableCombobox
            label="Add subject…"
            options={card.addable}
            onPick={card.add}
            onCreate={(name) => void card.createNew(name)}
            className="md:w-72"
          />
        )}
        <PlannedPeriods lines={card.planned} total={card.totalPeriods} />
      </div>
    </FormPanel>
  );
}
