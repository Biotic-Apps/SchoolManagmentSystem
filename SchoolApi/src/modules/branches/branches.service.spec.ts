import type { AuditService } from '../../core/audit/audit.service';
import type { AuthUser } from '../../core/common/types/auth-user';
import type { AccessCache } from '../../core/rbac/access/access-cache';
import { Scope } from '../../core/rbac/scope/scope';
import type { BranchesRepository, BranchRow } from './branches.repository';
import { BranchesService } from './branches.service';
import type { BranchSettingsRepository } from './settings/branch-settings.repository';

const row = (id: string, timings: object): BranchRow =>
  ({
    id,
    schoolId: 'school-1',
    school: { name: 'Demo School' },
    code: 'MAIN',
    name: 'Main',
    address: null,
    phone: null,
    email: null,
    timings,
    workingDays: [1, 2, 3, 4, 5, 6],
    principal: { id: 'user-p', name: 'Principal' },
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  }) as unknown as BranchRow;

const BEFORE = {
  opensAt: '08:00',
  closesAt: '14:00',
  attendanceLockAt: '11:00',
};
const AFTER = {
  opensAt: '08:00',
  closesAt: '14:00',
  attendanceLockAt: '10:30',
  staffArrivesAt: '07:15',
  staffLeavesAt: '14:30',
};

const principalScope = Scope.createLimited({
  schoolIds: [],
  branchIds: ['own'],
  sectionIds: [],
  memberSchoolIds: ['school-1'],
  memberBranchIds: ['own'],
});

function setup() {
  const repository = {
    findById: jest.fn((id: string) => Promise.resolve(row(id, BEFORE))),
    update: jest.fn((id: string, data: { timings?: object }) =>
      Promise.resolve(row(id, data.timings ?? BEFORE)),
    ),
  };
  const settings = { save: jest.fn().mockResolvedValue(undefined) };
  const audit = { stage: jest.fn<void, [object]>() };
  const service = new BranchesService(
    repository as unknown as BranchesRepository,
    {} as AccessCache,
    audit as unknown as AuditService,
    settings as unknown as BranchSettingsRepository,
  );
  return { service, repository, settings, audit };
}

const user = { id: 'user-p' } as AuthUser;

describe('BranchesService.update (principal timings)', () => {
  it('saves own-branch timings, syncs the attendance lock and audits before/after', async () => {
    const { service, repository, settings, audit } = setup();
    const result = await service.update(user, principalScope, 'own', {
      timings: AFTER,
      workingDays: [1, 2, 3, 4, 5],
    });

    expect(result.timings).toEqual(AFTER);
    expect(repository.update).toHaveBeenCalledWith(
      'own',
      expect.objectContaining({
        workingDays: [1, 2, 3, 4, 5],
        updatedById: 'user-p',
      }),
    );
    expect(settings.save).toHaveBeenCalledWith(
      'own',
      { 'attendance.lockTime': '10:30' },
      'user-p',
    );
    expect(audit.stage).toHaveBeenCalledTimes(1);
    expect(audit.stage.mock.calls[0][0]).toMatchObject({
      action: 'branch.update',
      entityId: 'own',
      before: { timings: { staffArrivesAt: '07:30' } },
      after: { timings: AFTER },
    });
  });

  it('refuses another branch without writing or auditing', async () => {
    const { service, repository, audit } = setup();
    await expect(
      service.update(user, principalScope, 'other', { timings: AFTER }),
    ).rejects.toMatchObject({ status: 403 });
    expect(repository.update).not.toHaveBeenCalled();
    expect(audit.stage).not.toHaveBeenCalled();
  });
});
