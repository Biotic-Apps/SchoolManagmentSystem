import type { PersonRef } from "@/features/people/types";
import { formatTimeRange } from "@/lib/time";
import { dayShort, SCHOOL_DAYS } from "./options";
import type { Conflict, Period, Slot, SlotInput, TeacherSlot } from "./types";
import { dateOfDay, shortDate } from "./week-dates";

export interface GridRow {
  periodIndex: number;
  title: string;
  time: string;
  isBreak: boolean;
}

export interface GridDay {
  day: number;
  title: string;
  caption?: string;
}

export interface CellValue {
  subject: PersonRef;
  staff: PersonRef;
  room: PersonRef | null;
}

export type CellMap = Record<string, CellValue>;

export const cellKey = (day: number, periodIndex: number) => `${day}-${periodIndex}`;

export function periodRows(periods: Period[]): GridRow[] {
  return [...periods]
    .sort((a, b) => a.index - b.index)
    .map((period) => ({
      periodIndex: period.index,
      title: period.label?.trim() || (period.isBreak ? "Break" : `Period ${period.index}`),
      time: formatTimeRange(period.startTime, period.endTime),
      isBreak: period.isBreak,
    }));
}

/** "P1 · 8:00 AM – 8:40 AM" for pickers. */
export function periodOptionLabel(period: Period): string {
  return `P${period.index} · ${formatTimeRange(period.startTime, period.endTime)}`;
}

export function dayColumns(days: number[], weekOf?: string): GridDay[] {
  return [...days]
    .sort((a, b) => a - b)
    .map((day) => ({ day, title: dayShort(day), caption: weekOf ? shortDate(dateOfDay(weekOf, day)) : undefined }));
}

export function slotsToCells(slots: Slot[]): CellMap {
  const cells: CellMap = {};
  for (const slot of slots) {
    cells[cellKey(slot.day, slot.periodIndex)] = { subject: slot.subject, staff: slot.staff, room: slot.room };
  }
  return cells;
}

export function cellsToSlotInputs(cells: CellMap): SlotInput[] {
  return Object.entries(cells).map(([key, cell]) => {
    const [day, periodIndex] = key.split("-").map(Number);
    return {
      day,
      periodIndex,
      subjectId: cell.subject.id,
      staffId: cell.staff.id,
      ...(cell.room ? { roomId: cell.room.id } : {}),
    };
  });
}

export const conflictKeys = (conflicts: Conflict[]) => new Set(conflicts.map((c) => cellKey(c.day, c.periodIndex)));

export function roomName(room: TeacherSlot["room"]): string | null {
  if (!room) return null;
  return typeof room === "string" ? room : room.name;
}

export interface TeacherWeek {
  days: GridDay[];
  rows: GridRow[];
  cells: Record<string, TeacherSlot[]>;
}

/** Rows are the distinct periods in the week; weekend columns appear only when something is scheduled. */
export function teacherWeek(slots: TeacherSlot[], weekOf: string): TeacherWeek {
  const cells: Record<string, TeacherSlot[]> = {};
  const rowMap = new Map<number, GridRow>();
  for (const slot of slots) {
    (cells[cellKey(slot.day, slot.periodIndex)] ??= []).push(slot);
    if (!rowMap.has(slot.periodIndex)) {
      rowMap.set(slot.periodIndex, {
        periodIndex: slot.periodIndex,
        title: `Period ${slot.periodIndex}`,
        time: formatTimeRange(slot.startTime, slot.endTime),
        isBreak: false,
      });
    }
  }
  const days = new Set([...SCHOOL_DAYS, ...slots.map((slot) => slot.day)]);
  return {
    days: dayColumns([...days], weekOf),
    rows: [...rowMap.values()].sort((a, b) => a.periodIndex - b.periodIndex),
    cells,
  };
}
