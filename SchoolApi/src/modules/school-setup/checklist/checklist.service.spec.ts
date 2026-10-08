import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { Scope } from '../../../core/rbac/scope/scope';
import type { ChecklistRepository } from './checklist.repository';
import { ChecklistService } from './checklist.service';

const user = (activeRole: string): AuthUser => ({
  id: 'u',
  sessionId: 's',
  tokenVersion: 0,
  activeRole,
  roles: [activeRole],
  permissions: new Set(['dashboard.view']),
  assignments: [],
});

const branchScope = (branchId: string) =>
  Scope.createLimited({
    schoolIds: [],
    branchIds: [branchId],
    sectionIds: [],
    memberSchoolIds: ['school'],
    memberBranchIds: [branchId],
  });

function setup() {
  const repository = {
    findBranch: jest.fn((id: string) =>
      Promise.resolve({ id, schoolId: 'school' }),
    ),
    counts: jest.fn().mockResolvedValue({
      session: 1,
      classes: 13,
      subjects: 8,
      bellSchedule: 9,
      teachers: 0,
      allocation: 0,
      students: 0,
      timetable: 0,
      feePlan: 0,
      sections: 0,
    }),
  };
  return {
    repository,
    service: new ChecklistService(repository as unknown as ChecklistRepository),
  };
}

describe('ChecklistService', () => {
  it('defaults a principal to their own branch, items in contract order', async () => {
    const { service } = setup();
    const result = await service.checklist(
      user('PRINCIPAL'),
      branchScope('b1'),
      {},
    );
    expect(result.branchId).toBe('b1');
    expect(result.complete).toBe(false);
    expect(result.items.map((i) => [i.key, i.done])).toEqual([
      ['session', true],
      ['classes', true],
      ['subjects', true],
      ['bellSchedule', true],
      ['teachers', false],
      // Nothing to allocate without sections.
      ['allocation', false],
      ['students', false],
      ['timetable', false],
      ['feePlan', false],
    ]);
  });

  it('keeps a principal inside their branch', async () => {
    const { service } = setup();
    await expect(
      service.checklist(user('PRINCIPAL'), branchScope('b1'), {
        branchId: 'b2',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN_SCOPE });
  });

  it('requires branchId from Super Admin and rejects other roles', async () => {
    const { service } = setup();
    await expect(
      service.checklist(user('SUPER_ADMIN'), Scope.createGlobal(), {}),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
    await expect(
      service.checklist(user('TEACHER'), branchScope('b1'), {}),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });
  });

  it('marks allocation done when every section subject has a teacher', async () => {
    const { service, repository } = setup();
    repository.counts.mockResolvedValueOnce({
      ...(await repository.counts()),
      allocation: 0,
      sections: 4,
    });
    const result = await service.checklist(
      user('PRINCIPAL'),
      branchScope('b1'),
      {},
    );
    expect(result.items.find((i) => i.key === 'allocation')).toEqual({
      key: 'allocation',
      done: true,
      count: 0,
    });
  });
});
