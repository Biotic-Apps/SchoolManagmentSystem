import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { StudentSkillDto } from './dto/skill.dto';

const DOMAIN_ORDER = { AFFECTIVE: 0, PSYCHOMOTOR: 1 } as const;

/** Rated behaviour & skills of students for report cards and parent results. */
@Injectable()
export class SkillCardReader {
  constructor(private readonly prisma: PrismaService) {}

  /** `examId:studentId` → rated items in card order. */
  async many(
    pairs: { examId: string; studentId: string }[],
  ): Promise<Map<string, StudentSkillDto[]>> {
    const map = new Map<string, StudentSkillDto[]>();
    if (pairs.length === 0) return map;
    const rows = await this.prisma.skillRating.findMany({
      where: {
        examId: { in: [...new Set(pairs.map((p) => p.examId))] },
        studentId: { in: [...new Set(pairs.map((p) => p.studentId))] },
      },
      include: { item: true },
    });
    const branchIds = [...new Set(rows.map((r) => r.branchId))];
    const levels = await this.prisma.skillScaleLevel.findMany({
      where: { branchId: { in: branchIds } },
    });
    const level = new Map(levels.map((l) => [`${l.branchId}:${l.value}`, l]));
    rows.sort(
      (a, b) =>
        DOMAIN_ORDER[a.item.domain] - DOMAIN_ORDER[b.item.domain] ||
        a.item.sortOrder - b.item.sortOrder ||
        a.item.name.localeCompare(b.item.name),
    );
    for (const row of rows) {
      const key = `${row.examId}:${row.studentId}`;
      const scale = level.get(`${row.branchId}:${row.value}`);
      const list = map.get(key) ?? [];
      list.push({
        domain: row.item.domain,
        name: row.item.name,
        value: row.value,
        code: scale?.code ?? String(row.value),
        label: scale?.label ?? '',
      });
      map.set(key, list);
    }
    return map;
  }

  async of(examId: string, studentId: string): Promise<StudentSkillDto[]> {
    return (
      (await this.many([{ examId, studentId }])).get(
        `${examId}:${studentId}`,
      ) ?? []
    );
  }

  /** Scale key printed under the skills table, highest first. */
  async scaleKey(branchId: string): Promise<string> {
    const levels = await this.prisma.skillScaleLevel.findMany({
      where: { branchId },
      orderBy: { value: 'desc' },
    });
    return levels.map((l) => `${l.code} = ${l.label}`).join('   ');
  }
}
