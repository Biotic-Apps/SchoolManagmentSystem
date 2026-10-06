export type ConflictType =
  | 'TEACHER_DOUBLE_BOOKED'
  | 'ROOM_DOUBLE_BOOKED'
  | 'TEACHER_NOT_ASSIGNED'
  | 'NON_WORKING_DAY'
  | 'BREAK_PERIOD';

export interface Conflict {
  type: ConflictType;
  day: number;
  periodIndex: number;
  message: string;
  otherSectionId?: string;
}

export interface PlannedSlot {
  day: number;
  periodIndex: number;
  subjectId: string;
  staffId: string;
  roomId: string | null;
}

export interface BusySlot extends PlannedSlot {
  sectionId: string;
}

export interface ConflictInput {
  slots: PlannedSlot[];
  breakPeriods: Set<number>;
  workingDays: Set<number>;
  /** Published slots of other sections in the same session. */
  others: BusySlot[];
  /** `staffId:subjectId` of subject teachers, `staffId:*` of class teachers. */
  teaching: Set<string>;
}

/** subjectId `*` stands for a class teacher (any subject). */
export const teachingKey = (staffId: string, subjectId: string) =>
  `${staffId}:${subjectId}`;

const at = (s: { day: number; periodIndex: number }) =>
  `${s.day}:${s.periodIndex}`;

/** Pure timetable check (backendFlows.md §5); no I/O, unit-tested. */
export function findConflicts(input: ConflictInput): Conflict[] {
  const byTeacher = new Map<string, BusySlot>();
  const byRoom = new Map<string, BusySlot>();
  for (const other of input.others) {
    byTeacher.set(`${other.staffId}@${at(other)}`, other);
    if (other.roomId) byRoom.set(`${other.roomId}@${at(other)}`, other);
  }

  const conflicts: Conflict[] = [];
  const add = (
    slot: PlannedSlot,
    type: ConflictType,
    message: string,
    other?: string,
  ) =>
    conflicts.push({
      type,
      day: slot.day,
      periodIndex: slot.periodIndex,
      message,
      ...(other && { otherSectionId: other }),
    });

  for (const slot of input.slots) {
    if (!input.workingDays.has(slot.day))
      add(slot, 'NON_WORKING_DAY', `Day ${slot.day} is not a working day`);
    if (input.breakPeriods.has(slot.periodIndex))
      add(slot, 'BREAK_PERIOD', `Period ${slot.periodIndex} is a break`);
    const assigned =
      input.teaching.has(teachingKey(slot.staffId, slot.subjectId)) ||
      input.teaching.has(teachingKey(slot.staffId, '*'));
    if (!assigned)
      add(
        slot,
        'TEACHER_NOT_ASSIGNED',
        'Teacher is not assigned to this subject in the section',
      );
    const teacherClash = byTeacher.get(`${slot.staffId}@${at(slot)}`);
    if (teacherClash)
      add(
        slot,
        'TEACHER_DOUBLE_BOOKED',
        'Teacher already teaches another section then',
        teacherClash.sectionId,
      );
    const roomClash = slot.roomId
      ? byRoom.get(`${slot.roomId}@${at(slot)}`)
      : undefined;
    if (roomClash)
      add(
        slot,
        'ROOM_DOUBLE_BOOKED',
        'Room is already used by another section then',
        roomClash.sectionId,
      );
  }
  return conflicts;
}
