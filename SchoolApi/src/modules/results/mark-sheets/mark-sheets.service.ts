import { Injectable } from '@nestjs/common';
import { invalid, notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ExamAccessService } from '../shared/exam-access.service';
import type {
  CompletenessRowDto,
  MarkSheetDto,
  MarkSheetQueryDto,
} from './dto/mark-sheet.dto';
import { MarkSheetAccessService } from './mark-sheet-access.service';
import {
  MarkSheetMapper,
  SHEET_INCLUDE,
  type SheetRow,
} from './mark-sheet.mapper';

/** Mark sheet lists, detail and completeness. */
@Injectable()
export class MarkSheetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exams: ExamAccessService,
    private readonly access: MarkSheetAccessService,
    private readonly mapper: MarkSheetMapper,
  ) {}

  async list(
    scope: Scope,
    examId: string,
    query: MarkSheetQueryDto,
  ): Promise<MarkSheetDto[]> {
    return this.mapper.many(await this.visible(scope, examId, query));
  }

  async get(scope: Scope, id: string): Promise<MarkSheetDto> {
    const { sheet } = await this.access.read(scope, id);
    return this.mapper.one(sheet);
  }

  async detail(id: string): Promise<MarkSheetDto> {
    const sheet = await this.prisma.markSheet.findUniqueOrThrow({
      where: { id },
      include: SHEET_INCLUDE,
    });
    return this.mapper.one(sheet);
  }

  async completeness(
    scope: Scope,
    examId: string,
    branchId?: string,
  ): Promise<CompletenessRowDto[]> {
    const sheets = await this.visible(scope, examId, {}, branchId);
    const dtos = await this.mapper.many(sheets);
    return dtos
      .map((d) => ({
        sheetId: d.id,
        classId: d.paper.classId,
        className: d.paper.className,
        sectionId: d.sectionId,
        sectionName: d.sectionName,
        subjectId: d.paper.subject.id,
        subjectName: d.paper.subject.name,
        status: d.status,
        entered: d.entered,
        total: d.total,
      }))
      .sort(
        (a, b) =>
          a.className.localeCompare(b.className) ||
          a.sectionName.localeCompare(b.sectionName) ||
          a.subjectName.localeCompare(b.subjectName),
      );
  }

  private async visible(
    scope: Scope,
    examId: string,
    query: MarkSheetQueryDto,
    branchId?: string,
  ): Promise<SheetRow[]> {
    if (scope.guardian) throw notFound('Exam');
    const exam = await this.exams.read(scope, examId);
    if (branchId && branchId !== exam.branchId)
      throw invalid('The exam belongs to another branch');
    const sheets = await this.prisma.markSheet.findMany({
      where: {
        examId,
        sectionId: query.sectionId,
        subjectId: query.subjectId,
      },
      include: SHEET_INCLUDE,
      orderBy: [{ sectionId: 'asc' }, { subjectId: 'asc' }],
    });
    return sheets.filter((s) => this.access.canRead(scope, s));
  }
}
