import type { Prisma } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import type { FollowUpDto, MeetingDto } from './dto/meeting.dto';
import type { MeetingSlotDto } from './dto/slot.dto';

const PERSON = { select: { id: true, name: true } } as const;

export const SLOT_INCLUDE = {
  staffUser: PERSON,
} satisfies Prisma.MeetingSlotInclude;

export type SlotRow = Prisma.MeetingSlotGetPayload<{
  include: typeof SLOT_INCLUDE;
}>;

export const FOLLOW_UP_INCLUDE = {
  owner: PERSON,
} satisfies Prisma.MeetingFollowUpInclude;

type FollowUpRow = Prisma.MeetingFollowUpGetPayload<{
  include: typeof FOLLOW_UP_INCLUDE;
}>;

export const MEETING_INCLUDE = {
  student: { select: { id: true, firstName: true, lastName: true } },
  guardian: { select: { id: true, name: true, userId: true } },
  staffUser: PERSON,
  followUps: { include: FOLLOW_UP_INCLUDE, orderBy: { dueDate: 'asc' } },
} satisfies Prisma.MeetingInclude;

export type MeetingRow = Prisma.MeetingGetPayload<{
  include: typeof MEETING_INCLUDE;
}>;

export function toSlotDto(row: SlotRow): MeetingSlotDto {
  return {
    id: row.id,
    staff: { userId: row.staffUser.id, name: row.staffUser.name },
    date: formatDate(row.date),
    startTime: row.startTime,
    endTime: row.endTime,
    mode: row.mode,
    location: row.location,
    status: row.status,
  };
}

export function toFollowUpDto(row: FollowUpRow): FollowUpDto {
  return {
    id: row.id,
    meetingId: row.meetingId,
    title: row.title,
    owner: row.owner,
    dueDate: formatDate(row.dueDate),
    status: row.status,
  };
}

/** Parents never see staff notes, and see the summary only when shared. */
export function toMeetingDto(row: MeetingRow, parentView: boolean): MeetingDto {
  return {
    id: row.id,
    student: {
      id: row.student.id,
      name: `${row.student.firstName} ${row.student.lastName}`,
    },
    guardian: { id: row.guardian.id, name: row.guardian.name },
    staff: { userId: row.staffUser.id, name: row.staffUser.name },
    date: formatDate(row.date),
    startTime: row.startTime,
    endTime: row.endTime,
    mode: row.mode,
    location: row.location,
    agenda: row.agenda,
    status: row.status,
    notes: parentView ? null : row.notes,
    summary: parentView && !row.shareSummary ? null : row.summary,
    followUps: row.followUps.map(toFollowUpDto),
  };
}
