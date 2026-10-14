import { Injectable } from '@nestjs/common';
import type { IncomeCategory } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { invalid } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { BranchAccess } from '../expenses/branch-access';
import type {
  CreateIncomeCategoryDto,
  IncomeCategoryDto,
  IncomeCategoryQueryDto,
} from './dto/income-category.dto';

const toDto = (row: IncomeCategory): IncomeCategoryDto => ({
  id: row.id,
  schoolId: row.schoolId,
  code: row.code,
  name: row.name,
  status: row.status,
});

function categoryCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 30);
}

@Injectable()
export class IncomeCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: IncomeCategoryQueryDto,
  ): Promise<IncomeCategoryDto[]> {
    const schoolId = await this.access.school(scope, query);
    const rows = await this.prisma.incomeCategory.findMany({
      where: { schoolId, status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
    return rows.map(toDto);
  }

  async create(
    scope: Scope,
    dto: CreateIncomeCategoryDto,
  ): Promise<IncomeCategoryDto> {
    const schoolId = await this.access.school(scope, dto);
    const name = dto.name.trim();
    const code = dto.code ?? categoryCode(name);
    if (code.length < 2) throw invalid('code cannot be derived from the name');
    const row = await this.prisma.incomeCategory.create({
      data: { schoolId, code, name },
    });
    this.audit.stage({
      action: 'income_category.create',
      entityType: 'IncomeCategory',
      entityId: row.id,
      schoolId,
      after: toDto(row),
    });
    return toDto(row);
  }
}
