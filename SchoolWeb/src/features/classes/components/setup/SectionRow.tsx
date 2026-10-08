"use client";

import { Trash2 } from "lucide-react";
import type { HintedOption } from "@/components/shared/select-option";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/lib/format";
import type { SectionsCardState } from "../../setup/use-sections-card";
import type { OverviewSection } from "../../setup-types";
import { CapacityInput } from "./CapacityInput";
import { GroupSelect } from "./GroupSelect";
import { RoomSelect } from "./RoomSelect";
import { SetupCell } from "./SetupCell";
import { TeacherSelect } from "./TeacherSelect";

interface SectionRowProps {
  section: OverviewSection;
  card: SectionsCardState;
  teacherOptions: HintedOption[];
  className: string;
}

export function SectionRow({ section, card, teacherOptions, className }: SectionRowProps) {
  const name = `Section ${section.name}`;
  const edit = card.canEdit;
  return (
    <li className={className}>
      <SetupCell label="Section">
        <span className="inline-grid size-9 place-items-center rounded-full bg-selected text-body font-semibold text-on-selected">
          {section.name}
        </span>
      </SetupCell>
      {card.showGroups && (
        <SetupCell label="Group">
          {edit ? (
            <GroupSelect
              label={`${name} group`}
              options={card.groupOptions}
              value={section.group}
              emptyLabel="No group"
              onSave={(group) => card.patchSection(section.id, { group })}
            />
          ) : (
            <span className="text-label text-fg">{section.group ?? "—"}</span>
          )}
        </SetupCell>
      )}
      <SetupCell label="Seats">
        {edit ? (
          <CapacityInput
            label={`${name} seats`}
            value={section.capacity}
            onSave={(capacity) => card.patchSection(section.id, { capacity })}
          />
        ) : (
          <span className="text-label tabular-nums text-fg">{formatNumber(section.capacity)}</span>
        )}
      </SetupCell>
      {card.showRooms && (
        <SetupCell label="Room">
          {edit ? (
            <RoomSelect
              label={`${name} room`}
              options={card.roomOptions}
              value={section.room?.id ?? null}
              onSave={(roomId) => card.patchSection(section.id, { roomId })}
              onCreate={card.createRoom}
            />
          ) : (
            <span className="text-label text-fg">{section.room?.name ?? "—"}</span>
          )}
        </SetupCell>
      )}
      <SetupCell label="Class teacher" className="col-span-2 md:col-span-1">
        <TeacherSelect
          label={`${name} class teacher`}
          options={teacherOptions}
          value={section.classTeacher?.id ?? null}
          onSave={(staffId) => card.setClassTeacher(section.id, staffId)}
          emptyLabel="No class teacher"
          readOnly={!card.canAllocate}
          readOnlyText={section.classTeacher?.name}
          flagEmpty
        />
      </SetupCell>
      <SetupCell label="Students">
        <span className="text-label tabular-nums text-fg">{formatNumber(section.studentCount)}</span>
      </SetupCell>
      {edit && (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={() => card.askRemove(section)} aria-label={`Remove ${name}`}>
            <Trash2 />
          </Button>
        </div>
      )}
    </li>
  );
}
