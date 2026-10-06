import type { PrismaService } from '../../../core/prisma/prisma.service';
import { periodEnd, periodStart } from '../../finance-core/period';
import type { ReportParams } from '../report-params';
import type { ReportTable } from '../report-table';

export interface ReportContext {
  prisma: PrismaService;
  params: ReportParams;
  /** School "today" at UTC midnight. */
  today: Date;
}

export type ReportQuery = (context: ReportContext) => Promise<ReportTable>;

export const str = (params: ReportParams, name: string): string =>
  String(params[name]);

export const monthRange = (month: string) => ({
  gte: periodStart(month),
  lte: periodEnd(month),
});

export async function branchName(
  prisma: PrismaService,
  branchId: string,
): Promise<string> {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { name: true },
  });
  return branch?.name ?? 'Branch';
}

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days from `from` to `to` (date-only values). */
export const daysBetween = (from: Date, to: Date): number =>
  Math.round((to.getTime() - from.getTime()) / DAY_MS);
