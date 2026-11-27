import type { Prisma, Section } from '../../generated/prisma/client';
import { AppError } from '../../core/common/errors/app-error';
import { ErrorCode } from '../../core/common/errors/error-code.enum';
import { RegisterWriter, type WriteInput } from './register-writer';
import type { RegistersRepository } from './registers.repository';

const section = { id: 'sec', schoolId: 's', branchId: 'b' } as Section;
const roster = [
  { studentId: 'ali', name: 'Ali', rollNo: 1, photoFileId: null },
  { studentId: 'new', name: 'New', rollNo: 2, photoFileId: null },
];

function setup(current: unknown) {
  const tx = {
    attendanceEntry: {
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      upsert: jest.fn(),
      findMany: jest.fn().mockResolvedValue([{ studentId: 'ali' }]),
    },
    attendanceRegister: {
      create: jest.fn().mockResolvedValue({ id: 'reg-new' }),
      update: jest.fn(),
    },
  };
  const repository = {
    lock: jest.fn().mockResolvedValue(current),
    roster: jest.fn().mockResolvedValue(roster),
  };
  const writer = new RegisterWriter(
    repository as unknown as RegistersRepository,
  );
  return { tx, writer };
}

const submitted = (status: 'SUBMITTED' | 'LOCKED') => ({
  id: 'reg',
  status,
  submittedById: 'principal',
  entries: [{ studentId: 'ali', status: 'ABSENT' }],
});

function input(patch: Partial<WriteInput>): WriteInput {
  return {
    section,
    date: new Date('2026-11-27T00:00:00Z'),
    entries: [],
    userId: 'teacher',
    action: 'SUBMIT',
    onBehalfOfStaffId: null,
    helper: false,
    pastLock: false,
    ...patch,
  };
}

async function code(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error instanceof AppError ? error.code : error;
  }
  return 'OK';
}

describe('RegisterWriter on a submitted or locked register', () => {
  it('refuses a changed mark after the lock time (correction needed)', async () => {
    const { tx, writer } = setup(submitted('SUBMITTED'));
    const result = code(
      writer.save(
        tx as unknown as Prisma.TransactionClient,
        input({
          userId: 'principal',
          pastLock: true,
          entries: [{ studentId: 'ali', status: 'PRESENT' }],
        }),
      ),
    );
    expect(await result).toBe(ErrorCode.RECORD_LOCKED);
    expect(tx.attendanceEntry.upsert).not.toHaveBeenCalled();
  });

  it('lets the class teacher mark a student enrolled after the submit', async () => {
    const { tx, writer } = setup(submitted('SUBMITTED'));
    const result = await writer.save(
      tx as unknown as Prisma.TransactionClient,
      input({
        entries: [
          { studentId: 'ali', status: 'ABSENT' },
          { studentId: 'new', status: 'PRESENT' },
        ],
      }),
    );
    expect(result.filledStudentIds).toEqual(['new']);
    expect(tx.attendanceEntry.createMany).toHaveBeenCalledWith({
      data: [
        {
          registerId: 'reg',
          studentId: 'new',
          status: 'PRESENT',
          remark: null,
        },
      ],
    });
    expect(tx.attendanceEntry.upsert).not.toHaveBeenCalled();
  });

  it('fills unmarked rows of a locked register and locks a late submitted one', async () => {
    const { tx, writer } = setup(submitted('SUBMITTED'));
    await writer.save(
      tx as unknown as Prisma.TransactionClient,
      input({
        pastLock: true,
        entries: [{ studentId: 'new', status: 'LATE' }],
      }),
    );
    expect(tx.attendanceRegister.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'LOCKED' }) as unknown,
      }),
    );
  });

  it('still answers ALREADY_SUBMITTED when someone else changes a mark', async () => {
    const { tx, writer } = setup(submitted('SUBMITTED'));
    const result = code(
      writer.save(
        tx as unknown as Prisma.TransactionClient,
        input({ entries: [{ studentId: 'ali', status: 'PRESENT' }] }),
      ),
    );
    expect(await result).toBe(ErrorCode.ALREADY_SUBMITTED);
  });

  it('keeps helpers out of submitted registers', async () => {
    const { tx, writer } = setup(submitted('LOCKED'));
    const result = code(
      writer.save(
        tx as unknown as Prisma.TransactionClient,
        input({
          helper: true,
          action: 'SAVE_DRAFT',
          entries: [{ studentId: 'new', status: 'PRESENT' }],
        }),
      ),
    );
    expect(await result).toBe(ErrorCode.FORBIDDEN);
  });
});

describe('RegisterWriter.submit', () => {
  it('locks a register submitted after the lock time straight away', async () => {
    const { tx, writer } = setup(null);
    await writer.submit(
      tx as unknown as Prisma.TransactionClient,
      'reg',
      { userId: 'teacher', onBehalfOfStaffId: null },
      new Set(),
      ['ali'],
      true,
    );
    expect(tx.attendanceRegister.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'LOCKED' }) as unknown,
      }),
    );
  });
});
