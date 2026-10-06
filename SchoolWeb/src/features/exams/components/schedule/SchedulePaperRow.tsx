"use client";

import { Trash2 } from "lucide-react";
import { OptionSelect, type Option } from "@/components/shared/OptionSelect";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TableCell, TableRow } from "@/components/ui/Table";
import { EMPTY_VALUE, formatDate } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { formatTimeRange } from "@/lib/time";
import type { ScheduleRow } from "../../schedule-rows";
import { TimeSelect12 } from "./TimeSelect12";

const NO_ROOM = "__none";

interface SchedulePaperRowProps {
  row: ScheduleRow;
  subjectOptions: Option[];
  roomOptions: Option[];
  readOnly: boolean;
  invalid: boolean;
  onChange: (patch: Partial<ScheduleRow>) => void;
  onRemove: () => void;
}

const nameOf = (options: Option[], id: string) => options.find((option) => option.id === id)?.name;

export function SchedulePaperRow(props: SchedulePaperRowProps) {
  return props.readOnly ? <ReadOnlyRow {...props} /> : <EditableRow {...props} />;
}

function ReadOnlyRow({ row, subjectOptions, roomOptions }: SchedulePaperRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{nameOf(subjectOptions, row.subjectId) ?? EMPTY_VALUE}</TableCell>
      <TableCell className="whitespace-nowrap">{formatDate(row.date)}</TableCell>
      <TableCell className="whitespace-nowrap" colSpan={2}>
        {formatTimeRange(row.startTime, row.endTime)}
      </TableCell>
      <TableCell className={NUMERIC_COLUMN}>{row.maxMarks}</TableCell>
      <TableCell className={NUMERIC_COLUMN}>{row.passMarks}</TableCell>
      <TableCell>{nameOf(roomOptions, row.roomId) ?? EMPTY_VALUE}</TableCell>
      <TableCell />
    </TableRow>
  );
}

function EditableRow({ row, subjectOptions, roomOptions, invalid, onChange, onRemove }: SchedulePaperRowProps) {
  return (
    <TableRow className={invalid ? "border-b-0 hover:bg-transparent" : "hover:bg-transparent"}>
      <TableCell className="min-w-44 px-2 py-2">
        <OptionSelect
          label="Subject"
          options={subjectOptions}
          value={row.subjectId || null}
          onChange={(subjectId) => onChange({ subjectId })}
        />
      </TableCell>
      <TableCell className="px-2 py-2">
        <Input
          type="date"
          aria-label="Date"
          value={row.date}
          onChange={(event) => onChange({ date: event.target.value })}
          className="min-w-36"
        />
      </TableCell>
      <TableCell className="px-2 py-2">
        <TimeSelect12 label="Start" value={row.startTime} onChange={(startTime) => onChange({ startTime })} />
      </TableCell>
      <TableCell className="px-2 py-2">
        <TimeSelect12 label="End" value={row.endTime} onChange={(endTime) => onChange({ endTime })} />
      </TableCell>
      <TableCell className="px-2 py-2">
        <Input
          aria-label="Max marks"
          inputMode="numeric"
          value={row.maxMarks}
          onChange={(event) => onChange({ maxMarks: event.target.value })}
          className="w-20 text-right tabular-nums"
        />
      </TableCell>
      <TableCell className="px-2 py-2">
        <Input
          aria-label="Pass marks"
          inputMode="numeric"
          value={row.passMarks}
          onChange={(event) => onChange({ passMarks: event.target.value })}
          className="w-20 text-right tabular-nums"
        />
      </TableCell>
      <TableCell className="min-w-36 px-2 py-2">
        <OptionSelect
          label="Room"
          options={[{ id: NO_ROOM, name: "No room" }, ...roomOptions]}
          value={row.roomId || NO_ROOM}
          onChange={(roomId) => onChange({ roomId: roomId === NO_ROOM ? "" : roomId })}
        />
      </TableCell>
      <TableCell className="px-2 py-2">
        <Button variant="ghost" size="icon" aria-label="Remove paper" onClick={onRemove}>
          <Trash2 />
        </Button>
      </TableCell>
    </TableRow>
  );
}
