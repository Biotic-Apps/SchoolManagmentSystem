import type { AccessCache } from '../../rbac/access/access-cache';
import type { LoginOtpRepository } from './login-otp.repository';
import { ParentEmailService } from './parent-email.service';

function setup(users: { id: string }[], roles: string[] = ['PARENT']) {
  const repository = {
    activeUsersByEmail: jest.fn().mockResolvedValue(users),
  };
  const access = {
    assignments: jest
      .fn()
      .mockResolvedValue(roles.map((roleKey) => ({ roleKey }))),
  };
  const service = new ParentEmailService(
    repository as unknown as LoginOtpRepository,
    access as unknown as AccessCache,
  );
  return { service, repository };
}

describe('ParentEmailService', () => {
  it('normalises typed addresses', () => {
    const { service } = setup([]);
    expect(service.normalize('  Parent@Example.COM ')).toBe(
      'parent@example.com',
    );
    expect(service.normalize('not-an-email')).toBeNull();
    expect(service.normalize('a b@c.de')).toBeNull();
  });

  it('finds the one active parent with the address', async () => {
    const { service, repository } = setup([{ id: 'u1' }]);
    await expect(service.findParent('p@x.pk')).resolves.toEqual({ id: 'u1' });
    expect(repository.activeUsersByEmail).toHaveBeenCalledWith('p@x.pk');
  });

  it('ignores non-parents and ambiguous matches', async () => {
    await expect(
      setup([{ id: 'u1' }], ['TEACHER']).service.findParent('t@x.pk'),
    ).resolves.toBeNull();
    await expect(
      setup([{ id: 'u1' }, { id: 'u2' }]).service.findParent('p@x.pk'),
    ).resolves.toBeNull();
    await expect(setup([]).service.findParent('p@x.pk')).resolves.toBeNull();
  });
});
