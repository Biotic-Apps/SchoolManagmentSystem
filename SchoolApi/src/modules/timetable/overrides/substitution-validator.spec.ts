import type { Section, Staff } from '../../../generated/prisma/client';
import { formatDate, parseDate } from '../../../core/common/dates';
import { today } from '../../../core/common/week';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import type { WorkingDayService } from '../../school-day/working-day.service';
import { SubstitutionValidator } from './substitution-validator';

const section = { id: 'sec-b', branchId: 'b', sessionId: 'ses' } as Section;
const sana = { id: 'sana', name: 'Sana' } as Staff;
const inDays = (n: number) => new Date(today().getTime() + n * 86_400_000);

function setup(over: {
  teaching?: number;
  leave?: number;
  covering?: number;
  lessons?: { timetable: { sectionId: string } }[];
  coveredLesson?: number;
  working?: boolean;
}) {
  const prisma = {
    academicSession: {
      findUnique: jest.fn().mockResolvedValue({
        startDate: inDays(-200),
        endDate: inDays(120),
      }),
    },
    staff: { count: jest.fn().mockResolvedValue(over.teaching ?? 1) },
    leaveRequest: { count: jest.fn().mockResolvedValue(over.leave ?? 0) },
    timetableOverride: {
      count: jest
        .fn()
        .mockResolvedValueOnce(over.covering ?? 0)
        .mockResolvedValue(over.coveredLesson ?? 0),
    },
    timetableSlot: {
      findMany: jest.fn().mockResolvedValue(over.lessons ?? []),
    },
  };
  const workingDays = {
    assertWorkingDay: jest.fn(() =>
      over.working === false
        ? Promise.reject(new Error('is not a working day'))
        : Promise.resolve(),
    ),
  };
  return new SubstitutionValidator(
    prisma as unknown as PrismaService,
    workingDays as unknown as WorkingDayService,
  );
}

describe('SubstitutionValidator dates', () => {
  it('refuses past days, dates outside the session and holidays', async () => {
    await expect(setup({}).assertDate(section, inDays(-4))).rejects.toThrow(
      'past day',
    );
    await expect(setup({}).assertDate(section, inDays(1600))).rejects.toThrow(
      'outside the academic session',
    );
    await expect(
      setup({ working: false }).assertDate(section, inDays(24)),
    ).rejects.toThrow('not a working day');
    await expect(
      setup({}).assertDate(section, parseDate(formatDate(today()))),
    ).resolves.toBeUndefined();
  });
});

describe('SubstitutionValidator substitute', () => {
  const day = inDays(10);

  it('refuses non-teaching staff (accountant, helper)', async () => {
    await expect(
      setup({ teaching: 0 }).assertSubstitute(section, sana, day, 3),
    ).rejects.toThrow('teaching staff');
  });

  it('refuses a substitute on approved leave', async () => {
    await expect(
      setup({ leave: 1 }).assertSubstitute(section, sana, day, 3),
    ).rejects.toThrow('on approved leave');
  });

  it('refuses a substitute already covering another class then', async () => {
    await expect(
      setup({ covering: 1 }).assertSubstitute(section, sana, day, 3),
    ).rejects.toThrow('already covers');
  });

  it('refuses a substitute with their own lesson in that period', async () => {
    const lessons = [{ timetable: { sectionId: 'sec-a' } }];
    await expect(
      setup({ lessons }).assertSubstitute(section, sana, day, 3),
    ).rejects.toThrow('teaches another class');
  });

  it('accepts a substitute whose own lesson is covered by someone else', async () => {
    const lessons = [{ timetable: { sectionId: 'sec-a' } }];
    await expect(
      setup({ lessons, coveredLesson: 1 }).assertSubstitute(
        section,
        sana,
        day,
        3,
      ),
    ).resolves.toBeUndefined();
  });
});
