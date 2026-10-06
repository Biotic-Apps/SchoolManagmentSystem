import type {
  GradeBand,
  GradingScheme,
} from '../../../generated/prisma/client';
import { decimalToNumber } from '../shared/hundredths';
import { sortBands } from './grade-bands';
import type { GradingSchemeDto } from './dto/grading-scheme.dto';

export type SchemeRow = GradingScheme & { bands: GradeBand[] };

export const SCHEME_INCLUDE = { bands: true } as const;

export function toGradingSchemeDto(
  row: SchemeRow,
  approverName: string | null,
): GradingSchemeDto {
  return {
    id: row.id,
    schoolId: row.schoolId,
    sessionId: row.sessionId,
    name: row.name,
    passPercent: row.passPercent,
    status: row.status,
    approvedBy: row.approvedById
      ? { id: row.approvedById, name: approverName ?? '' }
      : null,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    createdById: row.createdById,
    bands: sortBands(row.bands)
      .reverse()
      .map((b) => ({
        grade: b.grade,
        minPercent: b.minPercent,
        maxPercent: b.maxPercent,
        remark: b.remark,
        gradePoint: decimalToNumber(b.gradePoint),
      })),
    createdAt: row.createdAt.toISOString(),
  };
}
