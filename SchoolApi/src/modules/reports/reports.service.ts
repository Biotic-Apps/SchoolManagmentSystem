import { Injectable } from '@nestjs/common';
import { invalid, notFound, forbidden } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { UrlSigner } from '../../core/files/url-signer';
import { QUEUES } from '../../core/jobs/queues';
import type { Scope } from '../../core/rbac/scope/scope';
import { AsyncTaskService } from '../tasks/async-task.service';
import { toJobStatus } from '../tasks/job-status.dto';
import type {
  CreateReportDto,
  ReportCatalogEntryDto,
  ReportStatusDto,
} from './dto/report.dto';
import {
  canRunReport,
  catalogFor,
  findReport,
  REPORT_FORMATS,
  type CatalogViewer,
} from './report-catalog';
import { REPORT_JOB, type ReportJobInput } from './report-job';
import { validateParams } from './report-params';
import { ReportScopeService } from './report-scope.service';

const viewerOf = (user: AuthUser, scope: Scope): CatalogViewer => ({
  activeRole: user.activeRole,
  permissions: user.permissions,
  managesBranches:
    scope.global || scope.schoolIds.size > 0 || scope.branchIds.size > 0,
});

@Injectable()
export class ReportsService {
  constructor(
    private readonly tasks: AsyncTaskService,
    private readonly targets: ReportScopeService,
    private readonly signer: UrlSigner,
  ) {}

  catalog(user: AuthUser, scope: Scope): ReportCatalogEntryDto[] {
    return catalogFor(viewerOf(user, scope)).map((report) => ({
      key: report.key,
      title: report.title,
      description: report.description,
      formats: [...REPORT_FORMATS],
      params: report.params.map((p) => ({ ...p })),
    }));
  }

  async request(
    user: AuthUser,
    scope: Scope,
    dto: CreateReportDto,
  ): Promise<{ jobId: string }> {
    const report = findReport(dto.key);
    if (!report) throw invalid('Unknown report', { key: dto.key });
    if (!canRunReport(viewerOf(user, scope), report)) {
      throw forbidden('You cannot run this report');
    }
    const params = validateParams(report, dto.params);
    const target = await this.targets.resolve(scope, params);
    const jobId = await this.tasks.enqueue<ReportJobInput>(user, {
      queue: QUEUES.REPORTS,
      name: REPORT_JOB,
      data: {
        key: report.key,
        params,
        format: dto.format,
        schoolId: target.schoolId,
        requestedById: user.id,
      },
      schoolId: target.schoolId,
      branchId: target.branchId,
      format: dto.format,
      params: { key: report.key, ...params },
    });
    return { jobId };
  }

  async status(user: AuthUser, jobId: string): Promise<ReportStatusDto> {
    const task = await this.tasks.findOwn(jobId, user.id);
    if (!task || task.kind !== `${QUEUES.REPORTS}/${REPORT_JOB}`) {
      throw notFound('Report');
    }
    const job = toJobStatus(task, this.signer);
    const dto: ReportStatusDto = {
      status: job.status,
      fileUrl: job.result?.fileUrl ?? null,
    };
    if (typeof job.result?.count === 'number') dto.count = job.result.count;
    if (job.error) dto.error = job.error;
    return dto;
  }
}
