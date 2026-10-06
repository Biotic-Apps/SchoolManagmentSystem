import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { invalid, notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type {
  FeePlanItemInputDto,
  FeePlanDto,
  FeePlanQueryDto,
} from './dto/fee-plan.dto';
import {
  FEE_PLAN_INCLUDE,
  toFeePlanDto,
  type FeePlanRow,
} from './fee-plan.mapper';

/** Reads fee plans and validates plan items against the school's fee heads. */
@Injectable()
export class FeePlanReader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly people: SchoolPeopleService,
  ) {}

  async list(scope: Scope, query: FeePlanQueryDto): Promise<FeePlanDto[]> {
    const where: Prisma.FeePlanWhereInput = {
      ...scope.branchFilter(),
      branchId: query.branchId,
      sessionId: query.sessionId,
      classId: query.classId,
      status:
        query.status ??
        (query.includeArchived ? undefined : { not: 'ARCHIVED' }),
    };
    const rows = await this.prisma.feePlan.findMany({
      where,
      include: FEE_PLAN_INCLUDE,
      orderBy: [{ classId: 'asc' }, { name: 'asc' }],
      take: 500,
    });
    return this.toDtos(rows);
  }

  async find(id: string): Promise<FeePlanRow> {
    const row = await this.prisma.feePlan.findUnique({
      where: { id },
      include: FEE_PLAN_INCLUDE,
    });
    if (!row) throw notFound('Fee plan');
    return row;
  }

  async toDtos(rows: FeePlanRow[]): Promise<FeePlanDto[]> {
    const classes = await this.prisma.schoolClass.findMany({
      where: { id: { in: [...new Set(rows.map((r) => r.classId))] } },
      select: { id: true, name: true },
    });
    const userNames = await this.people.names(
      rows.map((r) => r.approvedById).filter((id): id is string => !!id),
    );
    const names = {
      classNames: new Map(classes.map((c) => [c.id, c.name])),
      userNames,
    };
    return rows.map((row) => toFeePlanDto(row, names));
  }

  /** Active, non-system heads of the school; no head twice. */
  async assertItems(
    schoolId: string,
    items: FeePlanItemInputDto[],
  ): Promise<void> {
    const ids = items.map((item) => item.feeHeadId);
    if (new Set(ids).size !== ids.length)
      throw invalid('A fee head can appear only once in a plan');
    const heads = await this.prisma.feeHead.findMany({
      where: { id: { in: ids }, schoolId, status: 'ACTIVE', system: false },
      select: { id: true },
    });
    const found = new Set(heads.map((h) => h.id));
    const missing = ids.filter((id) => !found.has(id));
    if (missing.length > 0) {
      throw invalid('Unknown or system fee head', { feeHeadIds: missing });
    }
  }
}
