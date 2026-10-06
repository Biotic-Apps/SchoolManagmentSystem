import { Injectable } from '@nestjs/common';
import type { PromotionDecision } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import { decimalToNumber } from '../shared/hundredths';
import { idName, LookupService } from '../shared/lookup.service';
import { RosterService } from '../shared/roster.service';
import type { PromotionRowDto } from './dto/promotion.dto';

@Injectable()
export class PromotionMapper {
  constructor(
    private readonly lookup: LookupService,
    private readonly roster: RosterService,
  ) {}

  async many(rows: PromotionDecision[]): Promise<PromotionRowDto[]> {
    const [people, classes, sections] = await Promise.all([
      this.roster.people(rows.map((r) => r.studentId)),
      this.lookup.classes(
        rows.flatMap((r) => [r.fromClassId, r.toClassId ?? r.fromClassId]),
      ),
      this.lookup.sections(
        rows.flatMap((r) => [
          r.fromSectionId,
          r.toSectionId ?? r.fromSectionId,
        ]),
      ),
    ]);
    return rows.map((r) => ({
      id: r.id,
      student: { id: r.studentId, name: people.get(r.studentId)?.name ?? '' },
      fromSessionId: r.fromSessionId,
      toSessionId: r.toSessionId,
      fromClass: idName(classes, r.fromClassId)!,
      fromSection: idName(sections, r.fromSectionId)!,
      toClass: idName(classes, r.toClassId),
      toSection: idName(sections, r.toSectionId),
      suggested: r.suggested,
      decision: r.decision,
      status: r.status,
      percent: decimalToNumber(r.percent),
      failedSubjects: r.failedSubjects,
      basis: r.basis,
      reason: r.reason,
      overridden: r.overriddenById !== null,
      approvalId: r.approvalId,
      effectiveDate: r.effectiveDate ? formatDate(r.effectiveDate) : null,
      appliedAt: r.appliedAt?.toISOString() ?? null,
      newEnrollmentId: r.newEnrollmentId,
    }));
  }
}
