"use client";

import { NumberStepper } from "@/components/shared/NumberStepper";
import { OrderButtons } from "@/components/shared/OrderButtons";
import { CreatableSelect } from "@/components/shared/CreatableSelect";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import type { SubjectsCardState } from "../../setup/use-subjects-card";
import type { ClassSubjectItem } from "../../setup-types";
import { SetupCell } from "./SetupCell";

interface SubjectRowProps {
  item: ClassSubjectItem;
  index: number;
  card: SubjectsCardState;
  className: string;
}

export function SubjectRow({ item, index, card, className }: SubjectRowProps) {
  const groupOptions = card.groups.map((group) => ({ id: group, name: `${group} only` }));
  const error = card.rowError?.subjectId === item.subjectId ? card.rowError.message : null;
  const optionalId = `optional-${item.subjectId}`;

  if (!card.canEdit) {
    return (
      <li className={className}>
        <span className="basis-full text-label font-medium text-fg md:basis-auto">{item.name}</span>
        <span className="text-label tabular-nums text-fg">{item.periodsPerWeek ?? "—"} / week</span>
        {card.groups.length > 0 && <span className="text-label text-fg-muted">{item.group ?? "All sections"}</span>}
        <span className="text-label text-fg-muted">{item.isOptional ? "Optional" : ""}</span>
      </li>
    );
  }

  return (
    <li className={className}>
      <div className="flex min-w-0 basis-full flex-col md:basis-auto">
        <span className="truncate text-label font-medium text-fg">{item.name}</span>
        {error && (
          <span role="alert" className="text-caption text-error">
            {error}
          </span>
        )}
      </div>
      <SetupCell label="Periods / week" hideLabel>
        <NumberStepper
          label={`${item.name} periods per week`}
          value={item.periodsPerWeek}
          onChange={(value) => card.setPeriods(item.subjectId, value)}
          min={0}
          max={20}
          allowEmpty
        />
      </SetupCell>
      {card.groups.length > 0 && (
        <SetupCell label="Taught to">
          <CreatableSelect
            label={`${item.name} taught to`}
            options={groupOptions}
            value={item.group}
            onChange={(group) => card.setGroup(item.subjectId, group)}
            emptyLabel="All sections"
          />
        </SetupCell>
      )}
      <div className="flex items-center gap-2">
        <Checkbox
          id={optionalId}
          checked={item.isOptional}
          onCheckedChange={(checked) => card.setOptional(item.subjectId, checked === true)}
        />
        <Label htmlFor={optionalId} className="font-normal">
          Optional
        </Label>
      </div>
      <div className="ml-auto flex justify-end">
        <OrderButtons
          label={item.name}
          index={index}
          count={card.items.length}
          onMove={card.move}
          onRemove={() => card.remove(item.subjectId)}
        />
      </div>
    </li>
  );
}
