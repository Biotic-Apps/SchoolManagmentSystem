import type { AuditService } from '../../core/audit/audit.service';
import type { PasswordHasher } from '../../core/auth/password/password-hasher';
import { ErrorCode } from '../../core/common/errors/error-code.enum';
import type { AuthUser } from '../../core/common/types/auth-user';
import type { PrismaService } from '../../core/prisma/prisma.service';
import type { SessionsRepository } from '../academic-sessions/sessions.repository';
import type { ClassesRepository } from '../academics/classes/classes.repository';
import type { SectionsRepository } from '../academics/sections/sections.repository';
import type { SubjectsRepository } from '../academics/subjects/subjects.repository';
import type { BranchesRepository } from '../branches/branches.repository';
import { PrincipalRepository } from '../branches/principal/principal.repository';
import type { BranchSettingsRepository } from '../branches/settings/branch-settings.repository';
import type { SchoolsRepository } from '../schools/schools.repository';
import type { SettingsRepository } from '../settings/settings.repository';
import type { UsersRepository } from '../users/users.repository';
import type { SchoolSetupDto } from './dto/school-setup.dto';
import { SchoolSetupService } from './school-setup.service';
import { AcademicsStep } from './steps/academics.step';
import { OrganisationStep } from './steps/organisation.step';
import { PrincipalStep } from './steps/principal.step';
import type { WelcomeNotifier } from './welcome-notifier';

const SUPER: AuthUser = {
  id: 'admin',
  sessionId: 's',
  tokenVersion: 0,
  activeRole: 'SUPER_ADMIN',
  roles: ['SUPER_ADMIN'],
  permissions: new Set(['schools.add', 'branches.add', 'users.add']),
  assignments: [],
};

const baseDto = (over: Partial<SchoolSetupDto> = {}): SchoolSetupDto =>
  ({
    school: { code: 'BSS', name: 'Bright School' },
    principal: { name: 'Ayesha Khan', email: 'Ayesha@Bright.pk' },
    ...over,
  }) satisfies SchoolSetupDto;

type Data = Record<string, unknown>;

/** Repository mock: resolves to what `make` builds from the create data. */
const returning = <T>(make: (data: Data) => T) =>
  jest.fn<Promise<T>, [Data, unknown?]>((data) => Promise.resolve(make(data)));

const uniqueViolation = () =>
  Object.assign(new Error('unique'), { code: 'P2002' });

function setup() {
  let seq = 0;
  const id = (prefix: string) => `${prefix}-${++seq}`;
  const tx = {
    user: { count: jest.fn().mockResolvedValue(0) },
    role: { findFirstOrThrow: jest.fn().mockResolvedValue({ id: 'role-p' }) },
    roleAssignment: {
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    branch: { update: jest.fn() },
    classSubject: { createMany: jest.fn() },
    branchPeriod: { createMany: jest.fn() },
    gradingScheme: {
      create: jest.fn((args: { data: Data }) =>
        Promise.resolve({ id: 'scheme-1', ...args.data }),
      ),
    },
  };
  const prisma = {
    $transaction: jest.fn((fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  };
  const schools = {
    create: returning((data) => ({
      id: 'school-1',
      ...data,
    })),
    logoFile: jest.fn(),
  };
  const settings = { upsert: jest.fn() };
  const branches = {
    create: returning((data) => ({
      id: 'branch-1',
      ...data,
      school: { name: 'Bright School' },
      principal: null,
      status: 'ACTIVE',
      createdAt: new Date(),
    })),
  };
  const branchSettings = { save: jest.fn() };
  const users = {
    create: returning((data) => ({
      id: 'user-1',
      ...data,
    })),
  };
  const sessions = {
    create: returning((data) => ({
      id: 'session-1',
      ...data,
      _count: { terms: 0 },
    })),
  };
  const classes = {
    create: returning((data) => ({
      id: id('class'),
      ...data,
      _count: { subjects: 0 },
    })),
  };
  const sections = {
    create: returning((data) => ({
      id: id('section'),
      ...data,
      capacity: null,
      roomId: null,
      classTeacherStaffId: null,
      status: 'ACTIVE',
      schoolClass: { name: 'x', levelOrder: 1 },
      room: null,
      session: { status: 'ACTIVE' },
      classTeacher: null,
      _count: { enrollments: 0 },
    })),
  };
  const subjects = {
    create: returning((data) => ({
      id: id('subject'),
      ...data,
    })),
  };
  const hasher = { hash: jest.fn((p: string) => Promise.resolve(`hash:${p}`)) };
  const welcome = { send: jest.fn().mockResolvedValue(undefined) };
  const audit = { stage: jest.fn() };

  const principals = new PrincipalRepository({} as PrismaService);
  const service = new SchoolSetupService(
    prisma as unknown as PrismaService,
    schools as unknown as SchoolsRepository,
    hasher as unknown as PasswordHasher,
    new OrganisationStep(
      schools as unknown as SchoolsRepository,
      settings as unknown as SettingsRepository,
      branches as unknown as BranchesRepository,
      branchSettings as unknown as BranchSettingsRepository,
    ),
    new PrincipalStep(users as unknown as UsersRepository, principals),
    new AcademicsStep(
      sessions as unknown as SessionsRepository,
      classes as unknown as ClassesRepository,
      sections as unknown as SectionsRepository,
      subjects as unknown as SubjectsRepository,
    ),
    welcome as unknown as WelcomeNotifier,
    audit as unknown as AuditService,
  );
  return {
    service,
    tx,
    schools,
    settings,
    branches,
    branchSettings,
    users,
    sessions,
    classes,
    sections,
    subjects,
    hasher,
    welcome,
    audit,
  };
}

describe('SchoolSetupService', () => {
  it('creates everything with the contract defaults', async () => {
    const t = setup();
    const result = await t.service.setup(SUPER, baseDto());

    expect(t.branches.create).toHaveBeenCalledWith(
      expect.objectContaining({
        schoolId: 'school-1',
        code: 'MAIN',
        name: 'Main Branch',
        timings: {
          opensAt: '08:00',
          closesAt: '14:00',
          attendanceLockAt: '10:00',
          staffArrivesAt: '07:30',
          staffLeavesAt: '14:00',
        },
        workingDays: [1, 2, 3, 4, 5, 6],
      }),
      t.tx,
    );
    expect(t.settings.upsert).toHaveBeenCalledWith(
      'school-1',
      expect.objectContaining({ primaryColor: '#0B7F74' }),
      t.tx,
    );
    expect(t.branchSettings.save).toHaveBeenCalledWith(
      'branch-1',
      { 'attendance.lockTime': '10:00' },
      'admin',
      t.tx,
    );
    expect(t.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ACTIVE', branchId: 'branch-1' }),
      t.tx,
    );
    expect(result.session?.name).toMatch(/^\d{4}-\d{2}$/);
    expect(result.session?.startDate).toMatch(/-04-01$/);
    expect(result.session?.endDate).toMatch(/-03-31$/);
    expect(result.counts).toEqual({
      classes: 13,
      sections: 13,
      subjects: 8,
      classSubjects: 104,
      periods: 9 + 7,
    });
    expect(t.classes.create.mock.calls.map((c) => c[0].name)).toEqual([
      'Playgroup',
      'Nursery',
      'Prep',
      ...Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`),
    ]);
    expect(t.subjects.create.mock.calls.map((c) => c[0].name)).toContain(
      'Nazra Quran',
    );
    expect(result.principal.email).toBe('ayesha@bright.pk');
    // Legacy path links every subject to every class and creates the default bell schedule.
    const links = t.tx.classSubject.createMany.mock.calls as [
      { data: { subjectId: string }[] },
    ][];
    expect(links).toHaveLength(13);
    expect(links[0][0].data).toHaveLength(8);
    const periods = (
      t.tx.branchPeriod.createMany.mock.calls[0] as [
        { data: { day: number; isBreak: boolean; endTime: string }[] },
      ]
    )[0].data;
    expect(periods.filter((p) => p.day === 0).at(-1)?.endTime).toBe('13:50');
    expect(periods.filter((p) => p.day === 5).at(-1)?.endTime).toBe('11:45');
    // The new session gets an approved default grading scheme.
    expect(t.tx.gradingScheme.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        sessionId: 'session-1',
        name: `Standard ${result.session?.name}`,
        status: 'APPROVED',
        passPercent: 40,
      }) as unknown,
    });
    // One audit row per created entity (+ principal link, curricula, bell schedule, grading scheme).
    expect(t.audit.stage).toHaveBeenCalledTimes(
      1 + 1 + 2 + 1 + 13 + 13 + 8 + 13 + 1 + 1,
    );
    expect(t.welcome.send).toHaveBeenCalledWith(
      'user-1',
      'Bright School',
      'Main Branch',
      expect.objectContaining({ email: 'ayesha@bright.pk' }),
    );
  });

  it('honours presets and sectionsPerClass', async () => {
    const t = setup();
    const result = await t.service.setup(
      SUPER,
      baseDto({
        academics: {
          classesPreset: 'STANDARD',
          sectionsPerClass: 3,
          subjectsPreset: 'NONE',
          sessionName: '2030 batch',
          startDate: '2030-08-01',
        },
      }),
    );
    expect(result.counts).toMatchObject({
      classes: 13,
      sections: 39,
      subjects: 0,
      classSubjects: 0,
    });
    const names = t.sections.create.mock.calls
      .slice(0, 3)
      .map((c) => c[0].name);
    expect(names).toEqual(['A', 'B', 'C']);
    expect(result.session).toMatchObject({
      name: '2030 batch',
      startDate: '2030-08-01',
      endDate: '2031-07-31',
    });
    expect(t.subjects.create).not.toHaveBeenCalled();
  });

  it('creates only the picked classes and subjects, keeping preset order', async () => {
    const t = setup();
    const result = await t.service.setup(
      SUPER,
      baseDto({
        academics: {
          classNames: ['Class 2', 'Nursery'],
          subjectNames: ['Urdu'],
        },
      }),
    );
    expect(result.counts).toMatchObject({
      classes: 2,
      sections: 2,
      subjects: 1,
      classSubjects: 2,
    });
    const classes = t.classes.create.mock.calls.map((c) => [
      c[0].name,
      c[0].levelOrder,
    ]);
    expect(classes).toEqual([
      ['Nursery', 2],
      ['Class 2', 5],
    ]);
    expect(t.subjects.create.mock.calls[0][0]).toMatchObject({
      code: 'URDU',
      name: 'Urdu',
    });
  });

  it('skips academics when createSession is false', async () => {
    const t = setup();
    const result = await t.service.setup(
      SUPER,
      baseDto({ academics: { createSession: false } }),
    );
    expect(result.session).toBeNull();
    expect(result.counts).toEqual({
      classes: 0,
      sections: 0,
      subjects: 0,
      classSubjects: 0,
      periods: 0,
    });
    expect(t.sessions.create).not.toHaveBeenCalled();
    expect(t.tx.gradingScheme.create).not.toHaveBeenCalled();
  });

  it('sets both principal links like PUT /branches/:id/principal', async () => {
    const t = setup();
    await t.service.setup(SUPER, baseDto());
    expect(t.tx.roleAssignment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        roleId: 'role-p',
        scopeType: 'BRANCH',
        schoolId: 'school-1',
        branchId: 'branch-1',
      }) as unknown,
    });
    expect(t.tx.branch.update).toHaveBeenCalledWith({
      where: { id: 'branch-1' },
      data: { principalUserId: 'user-1', updatedById: 'admin' },
    });
  });

  it('returns a temporary password only when it generated one', async () => {
    const generated = setup();
    const a = await generated.service.setup(SUPER, baseDto());
    expect(a.principal.temporaryPassword).toHaveLength(12);
    expect(generated.users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mustChangePassword: true,
        passwordHash: `hash:${a.principal.temporaryPassword}`,
      }),
      [],
      generated.tx,
    );

    const chosen = setup();
    const b = await chosen.service.setup(
      SUPER,
      baseDto({
        principal: {
          name: 'Ayesha',
          phone: '+923001234567',
          password: 'Chosen123',
        },
      }),
    );
    expect(b.principal).not.toHaveProperty('temporaryPassword');
    expect(chosen.users.create).toHaveBeenCalledWith(
      expect.objectContaining({ mustChangePassword: false }),
      [],
      chosen.tx,
    );
  });

  it('rolls back (nothing staged, no welcome) when the principal email is taken', async () => {
    const t = setup();
    t.tx.user.count.mockResolvedValue(1);
    await expect(t.service.setup(SUPER, baseDto())).rejects.toMatchObject({
      code: ErrorCode.USER_EMAIL_TAKEN,
      status: 409,
    });
    expect(t.schools.create).toHaveBeenCalled();
    expect(t.users.create).not.toHaveBeenCalled();
    expect(t.sessions.create).not.toHaveBeenCalled();
    expect(t.audit.stage).not.toHaveBeenCalled();
    expect(t.welcome.send).not.toHaveBeenCalled();
  });

  it('maps a duplicate school code to SCHOOL_CODE_TAKEN', async () => {
    const t = setup();
    t.schools.create.mockRejectedValue(uniqueViolation());
    await expect(t.service.setup(SUPER, baseDto())).rejects.toMatchObject({
      code: ErrorCode.SCHOOL_CODE_TAKEN,
    });
  });

  it('requires email or phone, a valid chosen password and Super Admin', async () => {
    const t = setup();
    await expect(
      t.service.setup(SUPER, baseDto({ principal: { name: 'No Contact' } })),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
    await expect(
      t.service.setup(
        SUPER,
        baseDto({
          principal: { name: 'Weak', email: 'w@x.pk', password: 'short' },
        }),
      ),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
    await expect(
      t.service.setup({ ...SUPER, activeRole: 'PRINCIPAL' }, baseDto()),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });
    expect(t.schools.create).not.toHaveBeenCalled();
  });

  it('creates per-class sections with groups and group-scoped curricula', async () => {
    const t = setup();
    const result = await t.service.setup(
      SUPER,
      baseDto({
        academics: {
          classes: [
            {
              name: 'Playgroup',
              level: 'EARLY',
              sections: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
              subjects: [{ name: 'English', periodsPerWeek: 6 }],
            },
            {
              name: 'Class 9',
              level: 'MATRIC',
              sections: [
                { name: 'A', group: 'Science' },
                { name: 'B', group: 'Arts' },
              ],
              subjects: [
                { name: 'English', periodsPerWeek: 6 },
                { name: 'Physics', periodsPerWeek: 6, group: 'Science' },
                { name: 'Pak Studies', group: 'Arts' },
              ],
            },
          ],
          bellSchedule: { periodsPerDay: 6, breakAfter: 3 },
        },
      }),
    );
    expect(result.counts).toEqual({
      classes: 2,
      sections: 5,
      subjects: 3,
      classSubjects: 4,
      periods: 7,
    });
    expect(t.subjects.create.mock.calls.map((c) => c[0].code)).toEqual([
      'ENG',
      'PHY',
      'PS',
    ]);
    const nine = t.sections.create.mock.calls.slice(3).map((c) => c[0]);
    expect(nine.map((x) => [x.name, x.group])).toEqual([
      ['A', 'Science'],
      ['B', 'Arts'],
    ]);
    const links = (
      t.tx.classSubject.createMany.mock.calls[1] as [
        { data: { group: string | null; sortOrder: number }[] },
      ]
    )[0].data;
    expect(links.map((l) => [l.group, l.sortOrder])).toEqual([
      [null, 0],
      ['Science', 1],
      ['Arts', 2],
    ]);
  });

  it('rejects a subject group no section of the class has', async () => {
    const t = setup();
    await expect(
      t.service.setup(
        SUPER,
        baseDto({
          academics: {
            classes: [
              {
                name: 'Class 9',
                sections: [{ name: 'A' }],
                subjects: [{ name: 'Physics', group: 'Science' }],
              },
            ],
          },
        }),
      ),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [
        expect.stringMatching(/^academics\.classes\.0\.subjects\.0\.group/),
      ],
    });
    expect(t.schools.create).not.toHaveBeenCalled();
  });
});
