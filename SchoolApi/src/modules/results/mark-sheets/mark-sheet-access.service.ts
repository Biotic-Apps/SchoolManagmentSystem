import { Injectable } from '@nestjs/common';
import type { Exam } from '../../../generated/prisma/client';
import { forbiddenScope, notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SHEET_INCLUDE, type SheetRow } from './mark-sheet.mapper';

export interface SheetContext {
  sheet: SheetRow;
  exam: Exam;
}

export interface SheetWriter extends SheetContext {
  /** Set when a supervisor enters marks for the assigned teacher (X). */
  onBehalfOfStaffId: string | null;
}

const branchOf = (sheet: SheetRow) => ({
  id: sheet.branchId,
  schoolId: sheet.schoolId,
});

/** Teachers reach the subject-sections they teach; managers the branch. */
@Injectable()
export class MarkSheetAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async load(id: string): Promise<SheetContext> {
    const sheet = await this.prisma.markSheet.findUnique({
      where: { id },
      include: { ...SHEET_INCLUDE, exam: true },
    });
    if (!sheet) throw notFound('Mark sheet');
    const { exam, ...rest } = sheet;
    return { sheet: rest, exam };
  }

  canRead(
    scope: Scope,
    sheet: {
      branchId: string;
      schoolId: string;
      sectionId: string;
      subjectId: string;
    },
  ): boolean {
    if (scope.guardian) return false;
    return (
      scope.canManageBranch({ id: sheet.branchId, schoolId: sheet.schoolId }) ||
      scope.canTeach(sheet.sectionId, sheet.subjectId)
    );
  }

  async read(scope: Scope, id: string): Promise<SheetContext> {
    if (scope.guardian) throw notFound('Mark sheet');
    const context = await this.load(id);
    if (!this.canRead(scope, context.sheet)) throw forbiddenScope();
    return context;
  }

  async write(user: AuthUser, scope: Scope, id: string): Promise<SheetWriter> {
    if (scope.guardian) throw notFound('Mark sheet');
    const context = await this.load(id);
    const { sheet } = context;
    if (scope.canTeach(sheet.sectionId, sheet.subjectId))
      return { ...context, onBehalfOfStaffId: null };
    if (
      user.permissions.has('teacherwork.proxy') &&
      scope.canManageBranch(branchOf(sheet))
    )
      return { ...context, onBehalfOfStaffId: sheet.teacherStaffId };
    throw forbiddenScope('You do not teach this subject in this section');
  }

  async manage(scope: Scope, id: string): Promise<SheetContext> {
    if (scope.guardian) throw notFound('Mark sheet');
    const context = await this.load(id);
    scope.assertManageBranch(branchOf(context.sheet));
    return context;
  }
}
