import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict, invalid } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ProbationGate } from '../../../core/probation/probation-gate';
import type { Scope } from '../../../core/rbac/scope/scope';
import { RosterService } from '../shared/roster.service';
import type { MarkSheetDto } from './dto/mark-sheet.dto';
import { EDITABLE_SHEET } from './mark-entry.service';
import { pendingStudents } from './mark-rows';
import { MarkSheetAccessService } from './mark-sheet-access.service';
import { MarkSheetNotifier } from './mark-sheet-notifier';
import { MarkSheetsService } from './mark-sheets.service';
import { reviewProblem } from './sheet-review-rules';
import {
  MARKS_SUBMIT_ACTION,
  MarkSubmitAction,
  type MarksSubmitPayload,
} from './mark-submit.action';

/** Submit (P)(X) by the teacher; accept / return by coordinator or principal. */
@Injectable()
export class MarkReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: MarkSheetAccessService,
    private readonly roster: RosterService,
    private readonly sheets: MarkSheetsService,
    private readonly action: MarkSubmitAction,
    private readonly gate: ProbationGate,
    private readonly notifier: MarkSheetNotifier,
    private readonly audit: AuditService,
  ) {}

  async submit(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<MarkSheetDto> {
    const { sheet, exam, onBehalfOfStaffId } = await this.access.write(
      user,
      scope,
      id,
    );
    if (exam.status !== 'MARKS_OPEN')
      throw conflict('Marks entry is not open for this exam');
    if (!(EDITABLE_SHEET as readonly string[]).includes(sheet.status))
      throw conflict(`The mark sheet is ${sheet.status.toLowerCase()}`);
    if (sheet.approvalId)
      throw conflict('The submission is awaiting probation review');
    const pending = await this.pendingRows(sheet);
    if (pending.length > 0)
      throw invalid('Marks are pending for some students', {
        studentIds: pending.map((p) => p.studentId),
      });

    const payload: MarksSubmitPayload = { sheetId: id };
    const outcome = await this.gate.run(
      { userId: user.id, onBehalfOfStaffId },
      {
        key: MARKS_SUBMIT_ACTION,
        entityType: 'MarkSheet',
        entityId: id,
        schoolId: sheet.schoolId,
        branchId: sheet.branchId,
        title: `Marks submission: ${exam.name}`,
        payload,
      },
      () =>
        this.prisma.$transaction((tx) =>
          this.action.apply(
            payload,
            { performedById: user.id, onBehalfOfStaffId },
            tx,
          ),
        ),
    );
    if (outcome.status === 'APPLIED')
      await this.notifier.submitted(sheet, user.id);
    return this.sheets.detail(id);
  }

  async decide(
    user: AuthUser,
    scope: Scope,
    id: string,
    decision: 'ACCEPTED' | 'RETURNED',
    comment?: string,
  ): Promise<MarkSheetDto> {
    const { sheet, exam } = await this.access.manage(scope, id);
    const pending =
      decision === 'ACCEPTED' ? await this.pendingRows(sheet) : [];
    const problem = reviewProblem({
      sheetStatus: sheet.status,
      examStatus: exam.status,
      decision,
      pendingNames: pending.map((p) => p.name),
      comment,
    });
    if (problem)
      throw conflict(
        problem,
        pending.length > 0
          ? { studentIds: pending.map((p) => p.studentId) }
          : undefined,
      );
    const updated = await this.prisma.markSheet.update({
      where: { id },
      data: {
        status: decision,
        decidedById: user.id,
        decidedAt: new Date(),
        comment: comment?.trim() || null,
        version: { increment: 1 },
      },
    });
    this.audit.stage({
      action: decision === 'ACCEPTED' ? 'marks.accept' : 'marks.return',
      entityType: 'MarkSheet',
      entityId: id,
      schoolId: sheet.schoolId,
      branchId: sheet.branchId,
      before: { status: sheet.status },
      after: { status: decision, comment: updated.comment },
    });
    if (decision === 'RETURNED')
      await this.notifier.returned(updated, updated.comment);
    return this.sheets.detail(id);
  }

  /** Active roster students with neither marks nor Absent on this sheet. */
  private async pendingRows(sheet: {
    sectionId: string;
    marks: { studentId: string; absent: boolean; marks: unknown }[];
  }) {
    const roster = await this.roster.of(sheet.sectionId);
    const entered = new Map(
      sheet.marks.map((m) => [
        m.studentId,
        { absent: m.absent, marksH: m.marks === null ? null : 1 },
      ]),
    );
    const ids = new Set(
      pendingStudents(
        roster.map((r) => r.studentId),
        entered,
      ),
    );
    return roster.filter((r) => ids.has(r.studentId));
  }
}
