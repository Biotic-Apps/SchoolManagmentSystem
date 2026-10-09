import type { Guardian, Prisma } from '../../../generated/prisma/client';
import type { AccountProvisioner } from '../../../core/accounts/account-provisioner';
import { ParentLoginWriter } from './parent-login.writer';

const guardian = (over: Partial<Guardian> = {}): Guardian =>
  ({
    id: 'g-1',
    schoolId: 'school-1',
    userId: null,
    name: 'Ahmed Khan',
    phone: '+92 300 1234567',
    email: 'Ahmed@Example.pk',
    ...over,
  }) as Guardian;

function setup() {
  const tx = {
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest
        .fn()
        .mockResolvedValue({ email: 'old@x.pk', phone: '+923000000000' }),
    },
    guardian: {
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn(),
    },
  };
  const accounts = {
    provision: jest.fn().mockResolvedValue({
      userId: 'parent-1',
      temporaryPassword: 'Temp1234abcd',
      created: true,
    }),
  };
  const writer = new ParentLoginWriter(
    accounts as unknown as AccountProvisioner,
  );
  const db = tx as unknown as Prisma.TransactionClient;
  return { writer, tx, db, accounts };
}

describe('ParentLoginWriter.ensure', () => {
  it('creates a PARENT login with a temporary password', async () => {
    const { writer, db, tx, accounts } = setup();
    const login = await writer.ensure(db, guardian(), 'actor');
    expect(login).toMatchObject({
      status: 'CREATED',
      email: 'ahmed@example.pk',
      phone: '+923001234567',
      temporaryPassword: 'Temp1234abcd',
    });
    expect(accounts.provision).toHaveBeenCalledWith(
      db,
      expect.objectContaining({ roleKey: 'PARENT', scopeType: 'GUARDIAN' }),
    );
    expect(tx.guardian.update).toHaveBeenCalledWith({
      where: { id: 'g-1' },
      data: { userId: 'parent-1' },
    });
  });

  it('keeps an existing login without a new password', async () => {
    const { writer, db, accounts } = setup();
    const login = await writer.ensure(
      db,
      guardian({ userId: 'parent-1' }),
      'actor',
    );
    expect(login).toMatchObject({
      status: 'EXISTING',
      email: 'old@x.pk',
      temporaryPassword: null,
    });
    expect(accounts.provision).not.toHaveBeenCalled();
  });

  it('skips when the phone already signs in for another guardian', async () => {
    const { writer, db, tx, accounts } = setup();
    tx.user.findMany.mockResolvedValue([{ id: 'other' }]);
    tx.guardian.count.mockResolvedValue(1);
    const login = await writer.ensure(db, guardian(), 'actor');
    expect(login.status).toBe('SKIPPED');
    expect(login.reason).toMatch(/another guardian/);
    expect(accounts.provision).not.toHaveBeenCalled();
  });

  it('skips when email and phone belong to different logins', async () => {
    const { writer, db, tx } = setup();
    tx.user.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);
    const login = await writer.ensure(db, guardian(), 'actor');
    expect(login.status).toBe('SKIPPED');
  });

  it('attaches to a matching login that is not a guardian yet', async () => {
    const { writer, db, tx, accounts } = setup();
    tx.user.findMany.mockResolvedValue([{ id: 'staff-user' }]);
    accounts.provision.mockResolvedValue({
      userId: 'staff-user',
      temporaryPassword: null,
      created: false,
    });
    const login = await writer.ensure(db, guardian(), 'actor');
    expect(login).toMatchObject({
      status: 'EXISTING',
      temporaryPassword: null,
    });
  });
});
