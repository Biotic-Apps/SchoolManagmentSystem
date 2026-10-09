import type { Prisma } from '../../generated/prisma/client';
import type { NotificationService } from '../../core/notifications/notification.service';
import {
  NoticeOverseers,
  type OverseenNotice,
} from './notice-overseers.service';

type Where = Prisma.RoleAssignmentWhereInput & {
  AND: { OR: Prisma.RoleAssignmentWhereInput[] }[];
};

const notice: OverseenNotice = {
  id: 'n1',
  schoolId: 'school',
  branchId: 'branch',
  authorId: 'coordinator',
  title: 'School closed',
  body: 'Closed on Friday',
};

function setup(principalIds: string[]) {
  const findMany = jest
    .fn<Promise<{ userId: string }[]>, [{ where: Where }]>()
    .mockResolvedValue(principalIds.map((userId) => ({ userId })));
  const db = {
    roleAssignment: { findMany },
  } as unknown as Prisma.TransactionClient;
  const notify = jest.fn();
  const overseers = new NoticeOverseers({
    notify,
  } as unknown as NotificationService);
  return { overseers, db, findMany, notify };
}

describe('NoticeOverseers', () => {
  it('finds principals of the branch and school-scoped principals', async () => {
    const { overseers, db, findMany } = setup(['p1', 'p1']);
    await expect(overseers.principals(notice, db)).resolves.toEqual(['p1']);
    const where = findMany.mock.calls[0][0].where;
    expect(where.role).toEqual({ key: 'PRINCIPAL' });
    expect(where.AND[1].OR).toEqual([
      { branchId: 'branch' },
      { scopeType: 'SCHOOL', schoolId: 'school' },
    ]);
  });

  it('school-level notice: principals anywhere in the school', async () => {
    const { overseers, db, findMany } = setup([]);
    await overseers.principals({ ...notice, branchId: null }, db);
    expect(findMany.mock.calls[0][0].where.AND[1].OR).toEqual([
      { schoolId: 'school' },
    ]);
  });

  it('notifies principals of a posted notice, not the author or recipients', async () => {
    const { overseers, db, notify } = setup(['p1', 'p2', 'coordinator']);
    await overseers.notifyPosted(notice, ['p2'], db);
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userIds: ['p1'],
        category: 'NOTICE',
        title: 'New notice: School closed',
        data: { noticeId: 'n1' },
      }),
    );
  });

  it('notifies principals of a notice awaiting approval', async () => {
    const { overseers, db, notify } = setup(['p1']);
    await overseers.notifyPending(notice, db);
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userIds: ['p1'],
        title: 'Notice awaiting approval: School closed',
      }),
    );
  });
});
