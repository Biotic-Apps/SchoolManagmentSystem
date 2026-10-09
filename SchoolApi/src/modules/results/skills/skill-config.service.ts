import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type {
  SkillConfigDto,
  SkillItemDto,
  SkillScaleLevelDto,
  UpdateSkillConfigDto,
} from './dto/skill.dto';
import { DEFAULT_SKILL_ITEMS, DEFAULT_SKILL_SCALE } from './skill-defaults';
import { configProblems, withSortOrder } from './skill-rules';

export interface BranchRef {
  id: string;
  schoolId: string;
}

export interface SkillSetup {
  items: SkillItemDto[];
  scale: SkillScaleLevelDto[];
}

const DOMAIN_ORDER = { AFFECTIVE: 0, PSYCHOMOTOR: 1 } as const;

/** Branch behaviour & skills: items per domain plus the rating scale. */
@Injectable()
export class SkillConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async branch(id: string): Promise<BranchRef> {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
    if (!branch) throw notFound('Branch');
    return branch;
  }

  async get(scope: Scope, branchId: string): Promise<SkillConfigDto> {
    const branch = await this.branch(branchId);
    if (scope.guardian) throw notFound('Branch');
    scope.assertReadBranch(branch);
    return { branchId, ...(await this.setup(branch)) };
  }

  /** Active items (domain, then card order) and the scale, highest first. */
  async setup(branch: BranchRef): Promise<SkillSetup> {
    await this.ensureDefaults(branch);
    const [items, levels] = await Promise.all([
      this.prisma.skillItem.findMany({
        where: { branchId: branch.id, active: true },
      }),
      this.prisma.skillScaleLevel.findMany({
        where: { branchId: branch.id },
        orderBy: { value: 'desc' },
      }),
    ]);
    return {
      items: items
        .sort(
          (a, b) =>
            DOMAIN_ORDER[a.domain] - DOMAIN_ORDER[b.domain] ||
            a.sortOrder - b.sortOrder ||
            a.name.localeCompare(b.name),
        )
        .map((i) => ({
          id: i.id,
          domain: i.domain,
          name: i.name,
          sortOrder: i.sortOrder,
        })),
      scale: levels.map((l) => ({
        value: l.value,
        code: l.code,
        label: l.label,
      })),
    };
  }

  /** Branches created after the migration get the defaults on first use. */
  private async ensureDefaults(branch: BranchRef): Promise<void> {
    const [items, levels] = await Promise.all([
      this.prisma.skillItem.count({ where: { branchId: branch.id } }),
      this.prisma.skillScaleLevel.count({ where: { branchId: branch.id } }),
    ]);
    const base = { schoolId: branch.schoolId, branchId: branch.id };
    if (items === 0)
      await this.prisma.skillItem.createMany({
        data: withSortOrder(DEFAULT_SKILL_ITEMS).map((i) => ({
          ...base,
          ...i,
        })),
        skipDuplicates: true,
      });
    if (levels === 0)
      await this.prisma.skillScaleLevel.createMany({
        data: DEFAULT_SKILL_SCALE.map((l) => ({ ...base, ...l })),
        skipDuplicates: true,
      });
  }

  /**
   * Replaces the branch list. Removed items keep their past ratings (made
   * inactive) when rated, else are deleted. The scale cannot shrink below a
   * value already used.
   */
  async replace(
    scope: Scope,
    branchId: string,
    dto: UpdateSkillConfigDto,
  ): Promise<SkillConfigDto> {
    const branch = await this.branch(branchId);
    if (scope.guardian) throw notFound('Branch');
    scope.assertManageBranch(branch);
    const problems = configProblems(dto.items, dto.scale);
    if (problems.length > 0)
      throw invalid('Invalid skills setup', { problems });
    const before = await this.setup(branch);
    const max = dto.scale.length;
    const overScale = await this.prisma.skillRating.count({
      where: { branchId, value: { gt: max } },
    });
    if (overScale > 0)
      throw conflict(
        `${overScale} ratings use a level above ${max}; keep those levels or clear the ratings first`,
      );

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.skillItem.findMany({ where: { branchId } });
      const byId = new Map(existing.map((i) => [i.id, i]));
      const byName = new Map(
        existing.map((i) => [`${i.domain}:${i.name.toLowerCase()}`, i]),
      );
      const kept = new Set<string>();
      for (const item of withSortOrder(dto.items)) {
        const match =
          (item.id ? byId.get(item.id) : undefined) ??
          byName.get(`${item.domain}:${item.name.toLowerCase()}`);
        const data = {
          domain: item.domain,
          name: item.name,
          sortOrder: item.sortOrder,
          active: true,
        };
        if (match) {
          kept.add(match.id);
          await tx.skillItem.update({ where: { id: match.id }, data });
        } else {
          const created = await tx.skillItem.create({
            data: { ...data, branchId, schoolId: branch.schoolId },
          });
          kept.add(created.id);
        }
      }
      const removed = existing.filter((i) => !kept.has(i.id));
      const rated = new Set(
        (
          await tx.skillRating.findMany({
            where: { itemId: { in: removed.map((i) => i.id) } },
            select: { itemId: true },
            distinct: ['itemId'],
          })
        ).map((r) => r.itemId),
      );
      await tx.skillItem.updateMany({
        where: {
          id: { in: removed.filter((i) => rated.has(i.id)).map((i) => i.id) },
        },
        data: { active: false },
      });
      await tx.skillItem.deleteMany({
        where: {
          id: { in: removed.filter((i) => !rated.has(i.id)).map((i) => i.id) },
        },
      });
      await tx.skillScaleLevel.deleteMany({ where: { branchId } });
      await tx.skillScaleLevel.createMany({
        data: dto.scale.map((l) => ({
          branchId,
          schoolId: branch.schoolId,
          value: l.value,
          code: l.code.trim(),
          label: l.label.trim(),
        })),
      });
    });
    const after = await this.setup(branch);
    this.audit.stage({
      action: 'skills.config_update',
      entityType: 'Branch',
      entityId: branchId,
      schoolId: branch.schoolId,
      before,
      after,
    });
    return { branchId, ...after };
  }
}
