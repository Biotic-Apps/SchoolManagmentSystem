import type { AuthUser } from '../../core/common/types/auth-user';
import type { Scope } from '../../core/rbac/scope/scope';
import type { SchoolPeopleService } from '../school-day/school-people.service';
import { LeaveService } from './leave.service';

type Ctor = ConstructorParameters<typeof LeaveService>;

describe('LeaveService own leave without a staff profile', () => {
  it('says the staff profile is missing instead of asking for a student', async () => {
    const people = { staffOfUser: jest.fn().mockResolvedValue(null) };
    const none = {} as never;
    const service = new LeaveService(
      none as Ctor[0],
      none,
      people as unknown as SchoolPeopleService,
      none,
      none,
      none,
      none,
      none,
    );
    await expect(
      service.create({ id: 'principal' } as AuthUser, {} as Scope, {
        from: '2026-12-08',
        to: '2026-12-08',
        reason: 'Family wedding',
      }),
    ).rejects.toThrow('You have no staff profile yet');
  });
});
