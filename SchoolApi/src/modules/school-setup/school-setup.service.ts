import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { normalizePhone } from '../../core/auth/identifier';
import { PasswordHasher } from '../../core/auth/password/password-hasher';
import { assertPasswordPolicy } from '../../core/auth/password/password-policy';
import { generateTemporaryPassword } from '../../core/auth/password/temporary-password';
import { formatDate } from '../../core/common/dates';
import { forbidden, invalid } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import { isSuperAdmin } from '../../core/rbac/actor';
import { SchoolsRepository } from '../schools/schools.repository';
import type { SchoolSetupDto } from './dto/school-setup.dto';
import type { SchoolSetupResultDto } from './dto/school-setup-result.dto';
import { SETUP_DEFAULTS } from './presets';
import { resolveSession } from './session-defaults';
import { AcademicsStep, type AcademicsPlan } from './steps/academics.step';
import { OrganisationStep } from './steps/organisation.step';
import { PrincipalStep, type PrincipalAccount } from './steps/principal.step';
import type { SetupContext } from './steps/setup-context';
import { WelcomeNotifier } from './welcome-notifier';

const REQUIRED = ['schools.add', 'branches.add', 'users.add'] as const;
const TX_OPTIONS = { timeout: 30_000, maxWait: 10_000 };

/** POST /schools/setup: everything in one transaction, or nothing. */
@Injectable()
export class SchoolSetupService {
  private readonly logger = new Logger(SchoolSetupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly schools: SchoolsRepository,
    private readonly hasher: PasswordHasher,
    private readonly organisation: OrganisationStep,
    private readonly principal: PrincipalStep,
    private readonly academics: AcademicsStep,
    private readonly welcome: WelcomeNotifier,
    private readonly audit: AuditService,
  ) {}

  async setup(
    user: AuthUser,
    dto: SchoolSetupDto,
  ): Promise<SchoolSetupResultDto> {
    this.assertSuperAdmin(user);
    const plan = this.plan(dto);
    await this.assertLogo(dto.school.logoFileId);
    const { account, temporaryPassword } = await this.account(dto);

    const ctx = { actorId: user.id, audit: [] } as Omit<SetupContext, 'tx'>;
    const created = await this.prisma.$transaction(async (tx) => {
      const step = { ...ctx, tx };
      const { school, branch } = await this.organisation.run(step, dto);
      const principal = await this.principal.run(step, branch, account);
      const academics = plan
        ? await this.academics.run(step, branch, plan)
        : null;
      return { school, branch, principal, academics };
    }, TX_OPTIONS);

    ctx.audit.forEach((entry) => this.audit.stage(entry));
    await this.welcome
      .send(
        created.principal.id,
        created.school.name,
        created.branch.name,
        account,
      )
      .catch((error: unknown) =>
        this.logger.warn(`Welcome notification not queued: ${String(error)}`),
      );

    const { school, branch, principal, academics } = created;
    return {
      school: { id: school.id, code: school.code, name: school.name },
      branch: { id: branch.id, code: branch.code, name: branch.name },
      principal: {
        id: principal.id,
        name: principal.name,
        email: principal.email,
        phone: principal.phone,
        ...(temporaryPassword && { temporaryPassword }),
      },
      session: academics && {
        id: academics.session.id,
        name: academics.session.name,
        startDate: formatDate(academics.session.startDate),
        endDate: formatDate(academics.session.endDate),
      },
      counts: academics?.counts ?? { classes: 0, sections: 0, subjects: 0 },
    };
  }

  private assertSuperAdmin(user: AuthUser): void {
    if (
      !isSuperAdmin(user) ||
      REQUIRED.some((key) => !user.permissions.has(key))
    )
      throw forbidden('Only Super Admin can set up a school');
  }

  /** Academics with defaults filled in; null when no session is wanted. */
  private plan(dto: SchoolSetupDto): AcademicsPlan | null {
    const input = dto.academics ?? {};
    if (input.createSession === false) return null;
    const session = resolveSession(input);
    if (session.endDate <= session.startDate) {
      const message = 'academics.endDate must be after academics.startDate';
      throw invalid(message, [message]);
    }
    return {
      session,
      classesPreset: input.classesPreset ?? SETUP_DEFAULTS.classesPreset,
      sectionsPerClass:
        input.sectionsPerClass ?? SETUP_DEFAULTS.sectionsPerClass,
      subjectsPreset: input.subjectsPreset ?? SETUP_DEFAULTS.subjectsPreset,
    };
  }

  /** Hashing is slow: done before the transaction opens. */
  private async account(dto: SchoolSetupDto) {
    const input = dto.principal;
    const email = input.email?.trim().toLowerCase() || null;
    const phone = input.phone ? normalizePhone(input.phone) : null;
    if (!email && !phone)
      throw invalid('principal.email or principal.phone is required', [
        'principal.email or principal.phone is required',
      ]);
    if (input.password) assertPasswordPolicy(input.password);
    const temporaryPassword = input.password
      ? null
      : generateTemporaryPassword();
    const account: PrincipalAccount = {
      name: input.name.trim(),
      email,
      phone,
      passwordHash: await this.hasher.hash(
        input.password ?? temporaryPassword!,
      ),
      mustChangePassword: temporaryPassword !== null,
    };
    return { account, temporaryPassword };
  }

  private async assertLogo(fileId?: string): Promise<void> {
    if (fileId && !(await this.schools.logoFile(fileId)))
      throw invalid(
        'school.logoFileId must reference an uploaded SCHOOL_LOGO file',
        ['school.logoFileId must reference an uploaded SCHOOL_LOGO file'],
      );
  }
}
