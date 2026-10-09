import type { AppConfigService } from '../../../config/app-config.service';
import type { AuditService } from '../../../core/audit/audit.service';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { PrintRosterService } from '../../students/print-roster/print-roster.service';
import type { AsyncTaskService } from '../../tasks/async-task.service';
import type { LoginSlipPlanReader } from './login-slip-plan.reader';
import { LoginSlipsService } from './login-slips.service';

const user = (permissions: string[]): AuthUser => ({
  id: 'principal',
  sessionId: 's',
  tokenVersion: 0,
  activeRole: 'PRINCIPAL',
  roles: ['PRINCIPAL'],
  permissions: new Set(permissions),
  assignments: [],
});

function setup(env: Record<string, unknown> = { CORS_ORIGINS: [] }) {
  const roster = {
    resolve: jest.fn().mockResolvedValue({
      sections: [{ id: 'sec-1', schoolId: 'school-1', branchId: 'b-1' }],
      studentIds: ['s1', 's2'],
      label: 'Class 5 A',
    }),
  };
  const plans = {
    read: jest.fn().mockResolvedValue([
      {
        studentId: 's1',
        guardian: {
          guardianId: 'g1',
          user: { status: 'ACTIVE', lastLoginAt: null, staffRoles: 0 },
        },
      },
      { studentId: 's2', guardian: { guardianId: 'g2', user: null } },
    ]),
  };
  const tasks = { enqueue: jest.fn().mockResolvedValue('job-1') };
  const audit = { stage: jest.fn() };
  const config = { get: (key: string) => env[key] };
  const service = new LoginSlipsService(
    roster as unknown as PrintRosterService,
    plans as unknown as LoginSlipPlanReader,
    tasks as unknown as AsyncTaskService,
    audit as unknown as AuditService,
    config as unknown as AppConfigService,
  );
  return { service, tasks, audit };
}

const scope = {} as Scope;
const ALLOWED = ['guardians.edit', 'users.edit'];

describe('LoginSlipsService', () => {
  it('needs users.edit as well', async () => {
    const { service, tasks } = setup();
    await expect(
      service.print(user(['guardians.edit']), scope, { sectionId: 'sec-1' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(tasks.enqueue).not.toHaveBeenCalled();
  });

  it('previews what changes, with the page the staff member uses', async () => {
    const { service } = setup();
    const preview = await service.preview(user(ALLOWED), scope, {
      sectionId: 'sec-1',
      loginUrl: 'http://192.168.1.5:3001/',
    });
    expect(preview).toMatchObject({ slips: 2, reset: 1, create: 1 });
    expect(preview.loginUrl).toBe('http://192.168.1.5:3001/login');
  });

  it('prefers PUBLIC_WEB_URL and queues a job without any password, audited', async () => {
    const { service, tasks, audit } = setup({
      PUBLIC_WEB_URL: 'https://school.example.pk',
      CORS_ORIGINS: [],
    });
    const result = await service.print(user(ALLOWED), scope, {
      sectionId: 'sec-1',
      loginUrl: 'http://evil.example/',
    });
    expect(result).toEqual({ jobId: 'job-1', count: 2 });
    const [, job] = tasks.enqueue.mock.calls[0] as [
      unknown,
      { data: Record<string, unknown> },
    ];
    expect(job.data.loginUrl).toBe('https://school.example.pk/login');
    expect(JSON.stringify(job.data)).not.toMatch(/password/i);
    expect(audit.stage).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'guardian.login_slips_print' }),
    );
  });
});
