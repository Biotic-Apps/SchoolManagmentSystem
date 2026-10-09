import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../../core/audit/audit.service';
import type { AuthUser } from '../../../../core/common/types/auth-user';
import { QUEUES } from '../../../../core/jobs/queues';
import type { Scope } from '../../../../core/rbac/scope/scope';
import { AsyncTaskService } from '../../../tasks/async-task.service';
import {
  PrintRosterService,
  slug,
} from '../../print-roster/print-roster.service';
import type { IdCardPrintDto, IdCardPrintJobDto } from './id-card-bulk.dto';
import {
  ID_CARD_SHEET_JOB,
  MAX_SHEET_CARDS,
  type IdCardSheetInput,
} from './id-card-bulk-job';

/** POST /students/id-cards/print: ID cards of a section/class on A4 sheets. */
@Injectable()
export class IdCardBulkService {
  constructor(
    private readonly roster: PrintRosterService,
    private readonly tasks: AsyncTaskService,
    private readonly audit: AuditService,
  ) {}

  async request(
    user: AuthUser,
    scope: Scope,
    dto: IdCardPrintDto,
  ): Promise<IdCardPrintJobDto> {
    const { sections, studentIds, label } = await this.roster.resolve(
      scope,
      dto,
      MAX_SHEET_CARDS,
    );
    const first = sections[0];
    const input: IdCardSheetInput = {
      schoolId: first.schoolId,
      requestedById: user.id,
      studentIds,
      baseName: `id-cards-${slug(label)}`,
    };
    const jobId = await this.tasks.enqueue(user, {
      queue: QUEUES.DOCUMENTS,
      name: ID_CARD_SHEET_JOB,
      data: input,
      params: { ...dto, count: studentIds.length },
      schoolId: first.schoolId,
      branchId: first.branchId,
      format: 'PDF',
    });
    this.audit.stage({
      action: 'student.id_card_sheet',
      entityType: 'Section',
      entityId: dto.sectionId ?? first.id,
      schoolId: first.schoolId,
      branchId: first.branchId,
      after: { ...dto, count: studentIds.length, jobId },
    });
    return { jobId, count: studentIds.length };
  }
}
