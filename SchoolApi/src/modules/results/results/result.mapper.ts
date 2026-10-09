import type { ExamResult } from '../../../generated/prisma/client';
import { decimalToNumber } from '../shared/hundredths';
import type { SubjectResult } from './result-calculator';
import type { Standing } from './standings';
import type { StudentResultDto } from './dto/result.dto';

export interface ResultPerson {
  name: string;
  rollNo: number | null;
}

export const subjectsOf = (
  row: Pick<ExamResult, 'subjects'>,
): SubjectResult[] =>
  Array.isArray(row.subjects)
    ? (row.subjects as unknown as SubjectResult[])
    : [];

export function toStudentResultDto(
  row: ExamResult,
  person: ResultPerson | undefined,
  standing?: Standing,
): StudentResultDto {
  return {
    studentId: row.studentId,
    name: person?.name ?? '',
    rollNo: person?.rollNo ?? null,
    examId: row.examId,
    classId: row.classId,
    sectionId: row.sectionId,
    subjects: subjectsOf(row).map((s) => ({
      subjectId: s.subjectId,
      name: s.name,
      marks: s.marks,
      maxMarks: s.maxMarks,
      absent: s.absent,
      grade: s.grade,
      passed: s.passed,
    })),
    totalMarks: decimalToNumber(row.totalMarks) ?? 0,
    maxTotal: row.maxTotal,
    percent: decimalToNumber(row.percent) ?? 0,
    grade: row.grade,
    position: row.position,
    sectionSize: standing?.sectionSize ?? 0,
    classPosition:
      row.position === null ? null : (standing?.classPosition ?? null),
    classSize: standing?.classSize ?? 0,
    passed: row.passed,
    remarks: row.remarks,
    teacherRemark: row.teacherRemark,
  };
}
