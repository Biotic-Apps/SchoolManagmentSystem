import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { toHundredths } from '../shared/hundredths';
import { type Standing, standingsOf } from './standings';

/** Loads standings (section size, class rank) of exam classes. */
@Injectable()
export class StandingsReader {
  constructor(private readonly prisma: PrismaService) {}

  /** `examId:studentId` → standing, for the given exam/class pairs. */
  async of(
    pairs: { examId: string; classId: string }[],
  ): Promise<Map<string, Standing>> {
    const map = new Map<string, Standing>();
    const unique = [
      ...new Map(pairs.map((p) => [`${p.examId}:${p.classId}`, p])).values(),
    ];
    if (unique.length === 0) return map;
    const rows = await this.prisma.examResult.findMany({
      where: {
        OR: unique.map((p) => ({ examId: p.examId, classId: p.classId })),
      },
      select: {
        examId: true,
        studentId: true,
        sectionId: true,
        classId: true,
        percent: true,
      },
    });
    for (const examId of new Set(rows.map((r) => r.examId))) {
      const standings = standingsOf(
        rows
          .filter((r) => r.examId === examId)
          .map((r) => ({ ...r, percentH: toHundredths(r.percent) })),
      );
      for (const [studentId, standing] of standings)
        map.set(`${examId}:${studentId}`, standing);
    }
    return map;
  }
}
