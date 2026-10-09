import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { loginPageUrl } from '../../../config/public-web-url';
import { AuditService } from '../../../core/audit/audit.service';
import { forbidden, invalid } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { QUEUES } from '../../../core/jobs/queues';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  PrintRosterService,
  slug,
} from '../../students/print-roster/print-roster.service';
import { AsyncTaskService } from '../../tasks/async-task.service';
import {
  LOGIN_SLIPS_JOB,
  MAX_LOGIN_SLIPS,
  type LoginSlipsInput,
} from './login-slip-job';
import { planCounts } from './login-slip-plan';
import { LoginSlipPlanReader } from './login-slip-plan.reader';
import type {
  LoginSlipJobDto,
  LoginSlipPreviewDto,
  LoginSlipPrintDto,
} from './login-slip.dto';

/** Parent login slips for a section/class: preview what changes, then print in the background. */
@Injectable()
export class LoginSlipsService {
  constructor(
    private readonly roster: PrintRosterService,
    private readonly plans: LoginSlipPlanReader,
    private readonly tasks: AsyncTaskService,
    private readonly audit: AuditService,
    private readonly config: AppConfigService,
  ) {}

  async preview(
    user: AuthUser,
    scope: Scope,
    dto: LoginSlipPrintDto,
  ): Promise<LoginSlipPreviewDto> {
    this.assertCanReset(user);
    const { studentIds } = await this.roster.resolve(
      scope,
      dto,
      MAX_LOGIN_SLIPS,
    );
    const counts = planCounts(await this.plans.read(studentIds));
    return { ...counts, loginUrl: this.loginUrl(dto) };
  }

  async print(
    user: AuthUser,
    scope: Scope,
    dto: LoginSlipPrintDto,
  ): Promise<LoginSlipJobDto> {
    this.assertCanReset(user);
    const { sections, studentIds, label } = await this.roster.resolve(
      scope,
      dto,
      MAX_LOGIN_SLIPS,
    );
    const counts = planCounts(await this.plans.read(studentIds));
    const first = sections[0];
    const input: LoginSlipsInput = {
      schoolId: first.schoolId,
      branchId: first.branchId,
      requestedById: user.id,
      studentIds,
      baseName: `parent-login-slips-${slug(label)}`,
      loginUrl: this.loginUrl(dto),
    };
    const { loginUrl: _url, ...target } = dto;
    void _url;
    const jobId = await this.tasks.enqueue(user, {
      queue: QUEUES.DOCUMENTS,
      name: LOGIN_SLIPS_JOB,
      data: input,
      params: { ...target, count: counts.slips },
      schoolId: first.schoolId,
      branchId: first.branchId,
      format: 'PDF',
    });
    this.audit.stage({
      action: 'guardian.login_slips_print',
      entityType: 'Section',
      entityId: dto.sectionId ?? first.id,
      schoolId: first.schoolId,
      branchId: first.branchId,
      after: { ...target, ...counts, jobId },
    });
    return { jobId, count: counts.slips };
  }

  /** Slips can replace passwords, so this also needs users.edit. */
  private assertCanReset(user: AuthUser): void {
    if (!user.permissions.has('users.edit'))
      throw forbidden(
        'Printing login slips also needs permission to manage user sign-ins',
      );
  }

  private loginUrl(dto: LoginSlipPrintDto): string {
    const url =
      loginPageUrl(this.config, true) ??
      dto.loginUrl?.replace(/\/+$/, '') ??
      loginPageUrl(this.config);
    if (!url)
      throw invalid('The school web address is not set (PUBLIC_WEB_URL)');
    return url.endsWith('/login') ? url : `${url}/login`;
  }
}
