import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict, invalid } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { ClientRequestService } from '../../../core/idempotency/client-request.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { formatHundredths } from '../shared/hundredths';
import { RosterService } from '../shared/roster.service';
import type { MarkSheetDto, SaveMarksDto } from './dto/mark-sheet.dto';
import { checkRows } from './mark-rows';
import { MarkSheetAccessService } from './mark-sheet-access.service';
import { MarkSheetsService } from './mark-sheets.service';

export const EDITABLE_SHEET = ['NOT_ENTERED', 'DRAFT', 'RETURNED'] as const;

/** PUT /mark-sheets/:id (X)(O): rows saved as DRAFT while marks entry is open. */
@Injectable()
export class MarkEntryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: MarkSheetAccessService,
    private readonly roster: RosterService,
    private readonly sheets: MarkSheetsService,
    private readonly requests: ClientRequestService,
    private readonly audit: AuditService,
  ) {}

  async save(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: SaveMarksDto,
  ): Promise<MarkSheetDto> {
    const { sheet, exam, onBehalfOfStaffId } = await this.access.write(
      user,
      scope,
      id,
    );
    const key = {
      userId: user.id,
      clientRequestId: dto.clientRequestId,
      action: 'marks.save',
    };
    if ((await this.requests.seen(key)) !== undefined)
      return this.sheets.detail(id);
    if (exam.status !== 'MARKS_OPEN')
      throw conflict('Marks entry is not open for this exam');
    if (!(EDITABLE_SHEET as readonly string[]).includes(sheet.status))
      throw conflict(`The mark sheet is ${sheet.status.toLowerCase()}`);
    if (sheet.approvalId)
      throw conflict('The submission is awaiting probation review');

    const roster = await this.roster.of(sheet.sectionId);
    const { rows, problems } = checkRows(
      dto.rows,
      sheet.paper.maxMarks,
      new Set(roster.map((r) => r.studentId)),
    );
    if (problems.length > 0) throw invalid('Invalid marks', { problems });

    await this.prisma.$transaction(
      async (tx) => {
        for (const row of rows) {
          const data = {
            marks: row.marksH === null ? null : formatHundredths(row.marksH),
            absent: row.absent,
            remark: row.remark,
          };
          await tx.mark.upsert({
            where: {
              markSheetId_studentId: {
                markSheetId: id,
                studentId: row.studentId,
              },
            },
            create: { markSheetId: id, studentId: row.studentId, ...data },
            update: data,
          });
        }
        await tx.markSheet.update({
          where: { id },
          data: {
            status: 'DRAFT',
            enteredById: user.id,
            onBehalfOfStaffId,
            version: { increment: 1 },
          },
        });
        await this.requests.remember(tx, key, id);
      },
      { timeout: 20_000 },
    );
    this.audit.stage({
      action: 'marks.save',
      entityType: 'MarkSheet',
      entityId: id,
      schoolId: sheet.schoolId,
      branchId: sheet.branchId,
      onBehalfOfStaffId: onBehalfOfStaffId ?? undefined,
      before: { status: sheet.status },
      after: { status: 'DRAFT', rows: rows.length },
    });
    return this.sheets.detail(id);
  }
}
