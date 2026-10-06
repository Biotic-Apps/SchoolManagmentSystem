import { Injectable } from '@nestjs/common';
import type {
  ExamPaper,
  Mark,
  MarkSheet,
} from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import { decimalToNumber } from '../shared/hundredths';
import { idName, LookupService } from '../shared/lookup.service';
import { RosterService } from '../shared/roster.service';
import type { MarkSheetDto } from './dto/mark-sheet.dto';

export type SheetRow = MarkSheet & { paper: ExamPaper; marks: Mark[] };

export const SHEET_INCLUDE = { paper: true, marks: true } as const;

const isEntered = (mark: Mark | undefined) =>
  !!mark && (mark.absent || mark.marks !== null);

@Injectable()
export class MarkSheetMapper {
  constructor(
    private readonly lookup: LookupService,
    private readonly roster: RosterService,
  ) {}

  async one(sheet: SheetRow): Promise<MarkSheetDto> {
    return (await this.many([sheet], true))[0];
  }

  async many(sheets: SheetRow[], withRows = false): Promise<MarkSheetDto[]> {
    const [classes, sections, subjects, staff, rosters] = await Promise.all([
      this.lookup.classes(sheets.map((s) => s.paper.classId)),
      this.lookup.sections(sheets.map((s) => s.sectionId)),
      this.lookup.subjects(sheets.map((s) => s.subjectId)),
      this.lookup.staff(sheets.map((s) => s.teacherStaffId)),
      this.roster.many(sheets.map((s) => s.sectionId)),
    ]);
    return sheets.map((sheet) => {
      const roster = rosters.get(sheet.sectionId) ?? [];
      const marks = new Map(sheet.marks.map((m) => [m.studentId, m]));
      return {
        id: sheet.id,
        examId: sheet.examId,
        paper: {
          classId: sheet.paper.classId,
          className: classes.get(sheet.paper.classId) ?? '',
          subject: {
            id: sheet.subjectId,
            name: subjects.get(sheet.subjectId) ?? '',
          },
          maxMarks: sheet.paper.maxMarks,
          passMarks: sheet.paper.passMarks,
          date: formatDate(sheet.paper.date),
        },
        sectionId: sheet.sectionId,
        sectionName: sections.get(sheet.sectionId) ?? '',
        status: sheet.status,
        teacher: idName(staff, sheet.teacherStaffId),
        entered: roster.filter((r) => isEntered(marks.get(r.studentId))).length,
        total: roster.length,
        comment: sheet.comment,
        approvalId: sheet.approvalId,
        rows: withRows
          ? roster.map((r) => {
              const mark = marks.get(r.studentId);
              return {
                studentId: r.studentId,
                name: r.name,
                rollNo: r.rollNo,
                marks: decimalToNumber(mark?.marks),
                absent: mark?.absent ?? false,
                remark: mark?.remark ?? null,
              };
            })
          : [],
      };
    });
  }
}
