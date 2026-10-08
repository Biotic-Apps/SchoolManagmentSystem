import {
  SEVERITY,
  type BusySlot,
  type Conflict,
  type ConflictInput,
  type ConflictType,
  type PlannedSlot,
} from './conflict-types';
import { weeklyConflicts } from './weekly-checks';

export * from './conflict-types';

/** subjectId `*` stands for a class teacher (any subject). */
export const teachingKey = (staffId: string, subjectId: string) =>
  `${staffId}:${subjectId}`;

const at = (s: { day: number; periodIndex: number }) =>
  `${s.day}:${s.periodIndex}`;

const where = (busy: BusySlot) =>
  busy.sectionName ? ` (${busy.sectionName})` : '';

export function conflictAt(
  slot: { day: number; periodIndex: number },
  type: ConflictType,
  message: string,
  otherSectionId?: string,
): Conflict {
  return {
    type,
    severity: SEVERITY[type],
    day: slot.day,
    periodIndex: slot.periodIndex,
    message,
    ...(otherSectionId && { otherSectionId }),
  };
}

function index(slots: BusySlot[] | undefined) {
  const byTeacher = new Map<string, BusySlot>();
  const byRoom = new Map<string, BusySlot>();
  for (const other of slots ?? []) {
    byTeacher.set(`${other.staffId}@${at(other)}`, other);
    if (other.roomId) byRoom.set(`${other.roomId}@${at(other)}`, other);
  }
  return { byTeacher, byRoom };
}

function placementConflicts(
  slot: PlannedSlot,
  input: ConflictInput,
): Conflict[] {
  const out: Conflict[] = [];
  if (!input.workingDays.has(slot.day))
    out.push(
      conflictAt(
        slot,
        'NON_WORKING_DAY',
        `Day ${slot.day} is not a working day`,
      ),
    );
  const isBreak = input.periodsOn(slot.day).get(slot.periodIndex);
  if (isBreak === undefined)
    out.push(
      conflictAt(
        slot,
        'PERIOD_NOT_ON_DAY',
        `Period ${slot.periodIndex} is not in this day's bell schedule`,
      ),
    );
  else if (isBreak)
    out.push(
      conflictAt(slot, 'BREAK_PERIOD', `Period ${slot.periodIndex} is a break`),
    );
  if (input.curriculum && !input.curriculum.has(slot.subjectId))
    out.push(
      conflictAt(
        slot,
        'SUBJECT_NOT_IN_CLASS',
        'Subject is not taught in this class (or this section group)',
      ),
    );
  const assigned =
    input.teaching.has(teachingKey(slot.staffId, slot.subjectId)) ||
    input.teaching.has(teachingKey(slot.staffId, '*'));
  if (!assigned)
    out.push(
      conflictAt(
        slot,
        'TEACHER_NOT_ASSIGNED',
        'Teacher is not assigned to this subject in the section',
      ),
    );
  return out;
}

/** Pure timetable check (contract §5.5); no I/O, unit-tested. */
export function findConflicts(input: ConflictInput): Conflict[] {
  const published = index(input.others);
  const drafts = index(input.otherDrafts);
  const conflicts: Conflict[] = [];

  for (const slot of input.slots) {
    conflicts.push(...placementConflicts(slot, input));
    const teacherKey = `${slot.staffId}@${at(slot)}`;
    const roomKey = slot.roomId ? `${slot.roomId}@${at(slot)}` : null;

    const teacherClash = published.byTeacher.get(teacherKey);
    if (teacherClash)
      conflicts.push(
        conflictAt(
          slot,
          'TEACHER_DOUBLE_BOOKED',
          `Teacher already teaches another section then${where(teacherClash)}`,
          teacherClash.sectionId,
        ),
      );
    const teacherDraft = drafts.byTeacher.get(teacherKey);
    if (teacherDraft && teacherDraft.sectionId !== teacherClash?.sectionId)
      conflicts.push(
        conflictAt(
          slot,
          'TEACHER_DRAFT_CLASH',
          `Teacher is also planned in another section's draft then${where(teacherDraft)}`,
          teacherDraft.sectionId,
        ),
      );

    const roomClash = roomKey ? published.byRoom.get(roomKey) : undefined;
    if (roomClash)
      conflicts.push(
        conflictAt(
          slot,
          'ROOM_DOUBLE_BOOKED',
          `Room is already used by another section then${where(roomClash)}`,
          roomClash.sectionId,
        ),
      );
    const roomDraft = roomKey ? drafts.byRoom.get(roomKey) : undefined;
    if (roomDraft && roomDraft.sectionId !== roomClash?.sectionId)
      conflicts.push(
        conflictAt(
          slot,
          'ROOM_DRAFT_CLASH',
          `Room is also planned in another section's draft then${where(roomDraft)}`,
          roomDraft.sectionId,
        ),
      );
  }
  return [...conflicts, ...weeklyConflicts(input)];
}
