import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import { SchoolDeletionService } from './school-deletion.service';
import type { SchoolPurgeService } from './school-purge.service';

const user = (activeRole: string): AuthUser => ({
  id: 'admin',
  sessionId: 's',
  tokenVersion: 0,
  activeRole,
  roles: [activeRole],
  permissions: new Set(['schools.delete']),
  assignments: [],
});
const SUPER = user('SUPER_ADMIN');
const SCHOOL = { id: 'sch', code: 'BS', name: 'Bright Star', status: 'ACTIVE' };

function setup(
  opts: { school?: typeof SCHOOL | null; run?: object | null } = {},
) {
  const school = opts.school === undefined ? SCHOOL : opts.school;
  const prisma = {
    school: {
      findUnique: jest.fn().mockResolvedValue(school),
      count: jest.fn().mockResolvedValue(school ? 1 : 0),
    },
    jobRun: { findFirst: jest.fn().mockResolvedValue(opts.run ?? null) },
  };
  const purge = {
    preview: jest.fn().mockResolvedValue({
      tables: {
        schools: 1,
        branches: 2,
        users: 1,
        students: 30,
        role_assignments: 4,
      },
      removedUsers: 1,
      keptUsers: 3,
    }),
  };
  const jobs = { dispatch: jest.fn().mockResolvedValue(undefined) };
  const service = new SchoolDeletionService(
    prisma as unknown as PrismaService,
    purge as unknown as SchoolPurgeService,
    jobs,
  );
  return { service, prisma, jobs };
}

describe('SchoolDeletionService', () => {
  it('previews headline counts and warns about the last active school', async () => {
    const { service, prisma } = setup();
    prisma.school.count.mockResolvedValueOnce(0);
    const preview = await service.preview(SUPER, 'sch');
    expect(preview).toMatchObject({
      code: 'BS',
      lastActiveSchool: true,
      removedUsers: 1,
      keptUsers: 3,
      totalRows: 38,
      summary: [
        { key: 'branches', count: 2 },
        { key: 'users', count: 1 },
        { key: 'students', count: 30 },
      ],
    });
  });

  it('is for super admins only', async () => {
    const { service } = setup();
    await expect(
      service.preview(user('PRINCIPAL'), 'sch'),
    ).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });
    await expect(
      service.request(user('PRINCIPAL'), 'sch', 'BS'),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });
  });

  it('requires the exact school code and queues the job', async () => {
    const { service, jobs } = setup();
    await expect(service.request(SUPER, 'sch', 'bs')).rejects.toMatchObject({
      code: ErrorCode.CONFIRM_CODE_MISMATCH,
    });
    expect(jobs.dispatch).not.toHaveBeenCalled();
    await expect(service.request(SUPER, 'sch', ' BS ')).resolves.toEqual({
      schoolId: 'sch',
      state: 'RUNNING',
      error: null,
    });
    expect(jobs.dispatch).toHaveBeenCalledWith(
      'maintenance',
      'schools.delete',
      {
        schoolId: 'sch',
        actorId: 'admin',
      },
    );
  });

  it('404s for an unknown school and 409s while a run is in progress', async () => {
    await expect(
      setup({ school: null }).service.request(SUPER, 'x', 'BS'),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    await expect(
      setup({ run: { status: 'RUNNING' } }).service.request(SUPER, 'sch', 'BS'),
    ).rejects.toMatchObject({ code: ErrorCode.CONFLICT });
  });

  it('reports status from the latest job run', async () => {
    const failed = setup({ run: { status: 'FAILED', error: 'boom' } });
    await expect(failed.service.status(SUPER, 'sch')).resolves.toMatchObject({
      state: 'FAILED',
      error: 'boom',
    });
    const gone = setup({ school: null, run: { status: 'COMPLETED' } });
    await expect(gone.service.status(SUPER, 'sch')).resolves.toMatchObject({
      state: 'DELETED',
    });
    await expect(setup().service.status(SUPER, 'sch')).resolves.toMatchObject({
      state: 'IDLE',
    });
  });
});
