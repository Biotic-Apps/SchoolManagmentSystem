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

  // Template settings (null = use defaults)
  templateName: string | null;
  showGradingScale: boolean;
  showSkills: boolean;
  showRemarks: boolean;
  showAttendance: boolean;
  showPosition: boolean;
  landscape: boolean;
  customSignatures: string[] | null;
  customFooterText: string | null;
  customHeaderOverrides: {
    showLogo?: boolean;
    schoolName?: string;
    subtitle?: string;
    address?: string;
    phone?: string;
  } | null;
  attendanceSummary: { present: number; absent: number; total: number } | null;
}

/** Everything a report card prints, for one ExamResult. */
@Injectable()
export class ReportCardLoader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly standings: StandingsReader,
    private readonly skills: SkillCardReader,
  ) {}

  async load(
    resultId: string,
    templateId?: string,
  ): Promise<ReportCardContent> {
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

    // Load template: explicit ID > branch default > school default
    const template = await this.resolveTemplate(
      templateId,
      result.branchId,
      result.schoolId,
    );

    // TODO: When template.showAttendance is true, load attendance summary
    // from the attendance table. Skipped for now since attendance module
    // integration is complex.
    const attendanceSummary: ReportCardContent['attendanceSummary'] = null;

    const layout = (template?.layout ?? {}) as Record<string, unknown>;
    const header = (template?.header ?? {}) as Record<string, unknown>;

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

      // Template fields
      templateName: template?.name ?? null,
      showGradingScale: template?.showGradingScale ?? true,
      showSkills: template?.showSkills ?? true,
      showRemarks: template?.showRemarks ?? true,
      showAttendance: template?.showAttendance ?? false,
      showPosition: template?.showPosition ?? true,
      landscape: layout.orientation === 'landscape',
      customSignatures: template ? (template.signatures as string[]) : null,
      customFooterText: template?.footerText ?? null,
      customHeaderOverrides: template
        ? {
            showLogo: header.showLogo as boolean | undefined,
            schoolName: header.schoolName as string | undefined,
            subtitle: header.subtitle as string | undefined,
            address: header.address as string | undefined,
            phone: header.phone as string | undefined,
          }
        : null,
      attendanceSummary,
    };
  }

  /** Resolve the template by explicit ID, branch default, or school default. */
  private async resolveTemplate(
    templateId: string | undefined,
    branchId: string,
    schoolId: string,
  ) {
    if (templateId) {
      return this.prisma.reportCardTemplate.findFirst({
        where: { id: templateId },
      });
    }
    // Branch-level default
    const branchDefault = await this.prisma.reportCardTemplate.findFirst({
      where: { branchId, isDefault: true },
      orderBy: { createdAt: 'desc' },
    });
    if (branchDefault) return branchDefault;
    // School-level default (branchId null)
    return this.prisma.reportCardTemplate.findFirst({
      where: { schoolId, branchId: null, isDefault: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
