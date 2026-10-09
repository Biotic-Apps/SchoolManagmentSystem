import type { PrismaService } from '../../core/prisma/prisma.service';
import type { StudentPlacementService } from '../school-day/student-placement.service';
import { MeetingTeachersService } from './meeting-teachers.service';

const placement = {
  studentId: 'student-1',
  name: 'Hamza Ahmed',
  schoolId: 'school',
  branchId: 'branch',
  sessionId: 'session',
  sectionId: 'section',
};

const person = (userId: string | null, name: string) => ({ userId, name });

function setup() {
  const prisma = {
    section: {
      findUnique: jest.fn().mockResolvedValue({ classTeacher: null }),
    },
    staffAssignment: {
      findMany: jest.fn().mockResolvedValue([
        {
          kind: 'SUBJECT_TEACHER',
          staff: person('aqsa', 'Aqsa'),
          subject: { name: 'English' },
        },
        {
          kind: 'SUBJECT_TEACHER',
          staff: person('aqsa', 'Aqsa'),
          subject: { name: 'Urdu' },
        },
        { kind: 'CLASS_TEACHER', staff: person('aqsa', 'Aqsa'), subject: null },
        {
          kind: 'SUBJECT_TEACHER',
          staff: person(null, 'No Login'),
          subject: { name: 'Art' },
        },
      ]),
    },
    timetableSlot: {
      findMany: jest
        .fn()
        .mockResolvedValue([
          { staff: person('bilal', 'Bilal'), subject: { name: 'Mathematics' } },
        ]),
    },
    branch: {
      findUnique: jest.fn().mockResolvedValue({
        principal: { id: 'boss', name: 'Principal Sara' },
      }),
    },
    meetingSlot: {
      groupBy: jest
        .fn()
        .mockResolvedValue([{ staffUserId: 'bilal', _count: { _all: 3 } }]),
    },
  };
  const service = new MeetingTeachersService(
    prisma as unknown as PrismaService,
    {} as StudentPlacementService,
  );
  return { service, prisma };
}

describe('MeetingTeachersService', () => {
  it('lists class, subject and timetable teachers plus the principal, even without open slots', async () => {
    const { service } = setup();
    const teachers = await service.forPlacement(placement);
    expect(teachers).toEqual([
      {
        userId: 'aqsa',
        name: 'Aqsa',
        roles: ['English', 'Urdu', 'Class teacher'],
        openSlots: 0,
      },
      { userId: 'bilal', name: 'Bilal', roles: ['Mathematics'], openSlots: 3 },
      {
        userId: 'boss',
        name: 'Principal Sara',
        roles: ['Principal'],
        openSlots: 0,
      },
    ]);
  });

  it('counts only open slots from today in the child branch', async () => {
    const { service, prisma } = setup();
    await service.forPlacement(placement);
    expect(prisma.meetingSlot.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          branchId: 'branch',
          status: 'OPEN',
        }) as unknown,
      }),
    );
  });
});
