import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { fullName } from '../../students/student.mapper';
import { decimalToNumber } from '../shared/hundredths';
import type { SubjectResult } from '../results/result-calculator';
import { subjectsOf } from '../results/result.mapper';
import type { Standing } from '../results/standings';
import { StandingsReader } from '../results/standings.reader';
import type { StudentSkillDto } from '../skills/dto/skill.dto';
import { SkillCardReader } from '../skills/skill-card.reader';

export interface ReportCardContent {
  schoolName: string;
  branchLine: string;
  examName: string;
  studentName: string;
  admissionNo: string;
  className: string;
  sectionName: string;
  rollNo: number | null;
  sessionName: string;
  subjects: SubjectResult[];
  totalMarks: number | null;
  maxTotal: number;
  percent: number;
  grade: string;
  passed: boolean;
  position: number | null;
  standing: Standing | undefined;
  remarks: string | null;
  teacherRemark: string | null;
  skills: StudentSkillDto[];
  scaleKey: string;
}

/** Everything a report card prints, for one ExamResult. */
@Injectable()
export class ReportCardLoader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly standings: StandingsReader,
    private readonly skills: SkillCardReader,
  ) {}

  async load(resultId: string): Promise<ReportCardContent> {
    const result = await this.prisma.examResult.findUniqueOrThrow({
      where: { id: resultId },
      include: {
        exam: true,
        student: {
          select: { firstName: true, lastName: true, admissionNo: true },
        },
      },
    });
    const [school, branch, section, session, enrollment] = await Promise.all([
      this.prisma.school.findUniqueOrThrow({ where: { id: result.schoolId } }),
      this.prisma.branch.findUniqueOrThrow({ where: { id: result.branchId } }),
      this.prisma.section.findUniqueOrThrow({
        where: { id: result.sectionId },
        include: { schoolClass: { select: { name: true } } },
      }),
      this.prisma.academicSession.findUniqueOrThrow({
        where: { id: result.exam.sessionId },
      }),
      this.prisma.enrollment.findFirst({
        where: { studentId: result.studentId, sectionId: result.sectionId },
        orderBy: { startDate: 'desc' },
        select: { rollNo: true },
      }),
    ]);
    const [standings, skills, scaleKey] = await Promise.all([
      this.standings.of([result]),
      this.skills.of(result.examId, result.studentId),
      this.skills.scaleKey(result.branchId),
    ]);
    return {
      schoolName: school.name,
      branchLine: [branch.name, branch.address, branch.phone]
        .filter(Boolean)
        .join(' · '),
      examName: result.exam.name,
      studentName: fullName(result.student),
      admissionNo: result.student.admissionNo,
      className: section.schoolClass.name,
      sectionName: section.name,
      rollNo: enrollment?.rollNo ?? null,
      sessionName: session.name,
      subjects: subjectsOf(result),
      totalMarks: decimalToNumber(result.totalMarks),
      maxTotal: result.maxTotal,
      percent: decimalToNumber(result.percent) ?? 0,
      grade: result.grade,
      passed: result.passed,
      position: result.position,
      standing: standings.get(`${result.examId}:${result.studentId}`),
      remarks: result.remarks,
      teacherRemark: result.teacherRemark,
      skills,
      scaleKey,
    };
  }
}
