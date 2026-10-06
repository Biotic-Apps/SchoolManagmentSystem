import { Injectable } from '@nestjs/common';
import { toJson } from '../../../core/common/prisma-json';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { BranchSettingsReader } from '../../branches/settings/branch-settings.reader';
import { formatHundredths, toHundredths } from '../shared/hundredths';
import { subjectsOf } from '../results/result.mapper';
import {
  averagePercentH,
  failedSubjectCount,
  suggestPromotion,
  targetClassId,
} from './promotion-rules';
import { isLastClass, nextClass } from './target-section';

export interface SuggestInput {
  branchId: string;
  fromSessionId: string;
  toSessionId: string;
  examIds: string[];
}

/** Builds SUGGESTED decisions; manual overrides and decided rows are kept. */
@Injectable()
export class PromotionBuilder {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: BranchSettingsReader,
  ) {}

  async run(input: SuggestInput): Promise<number> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        branchId: input.branchId,
        sessionId: input.fromSessionId,
        status: 'ACTIVE',
      },
      include: { section: { select: { classId: true } } },
    });
    if (enrollments.length === 0) return 0;
    const studentIds = enrollments.map((e) => e.studentId);
    const [classes, minPassPercent, results, existing] = await Promise.all([
      this.prisma.schoolClass.findMany({
        where: { schoolId: enrollments[0].schoolId, status: 'ACTIVE' },
        select: { id: true, levelOrder: true },
      }),
      this.settings.get<number>(input.branchId, 'promotion.minPassPercent'),
      this.prisma.examResult.findMany({
        where: { examId: { in: input.examIds }, studentId: { in: studentIds } },
      }),
      this.prisma.promotionDecision.findMany({
        where: {
          studentId: { in: studentIds },
          fromSessionId: input.fromSessionId,
        },
      }),
    ]);
    const kept = new Set(
      existing
        .filter(
          (d) => d.status !== 'SUGGESTED' || d.overriddenById || d.approvalId,
        )
        .map((d) => d.studentId),
    );
    let count = 0;
    for (const enrollment of enrollments) {
      if (kept.has(enrollment.studentId)) continue;
      const mine = results.filter((r) => r.studentId === enrollment.studentId);
      const percentH = averagePercentH(
        mine.map((r) => toHundredths(r.percent)),
      );
      const failedSubjects = failedSubjectCount(
        mine.map((r) => ({ subjects: subjectsOf(r) })),
      );
      const fromClassId = enrollment.section.classId;
      const suggestion = suggestPromotion({
        isLastClass: isLastClass(classes, fromClassId),
        percentH,
        failedSubjects,
        minPassPercent,
      });
      const data = {
        schoolId: enrollment.schoolId,
        branchId: enrollment.branchId,
        toSessionId: input.toSessionId,
        fromSectionId: enrollment.sectionId,
        fromClassId,
        toClassId: targetClassId(
          suggestion.decision,
          fromClassId,
          nextClass(classes, fromClassId)?.id ?? null,
        ),
        toSectionId: null,
        suggested: suggestion.decision,
        decision: suggestion.decision,
        percent: percentH === null ? null : formatHundredths(percentH),
        failedSubjects,
        basis: toJson({
          examIds: input.examIds,
          exams: mine.map((r) => ({
            examId: r.examId,
            percent: toHundredths(r.percent) / 100,
          })),
          note: suggestion.note,
        }),
        reason: null,
      };
      await this.prisma.promotionDecision.upsert({
        where: {
          studentId_fromSessionId: {
            studentId: enrollment.studentId,
            fromSessionId: input.fromSessionId,
          },
        },
        create: {
          studentId: enrollment.studentId,
          fromSessionId: input.fromSessionId,
          ...data,
        },
        update: data,
      });
      count++;
    }
    return count;
  }
}
