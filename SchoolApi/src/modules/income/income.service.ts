import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { parseDate } from '../../core/common/dates';
import { notFound } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../core/common/pagination/paginate';
import type { AuthUser } from '../../core/common/types/auth-user';
import { UrlSigner } from '../../core/files/url-signer';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { BranchAccess } from '../expenses/branch-access';
import type {
  CreateIncomeDto,
  IncomeQueryDto,
  UpdateIncomeDto,
} from './dto/income-input.dto';
import type { IncomeDto } from './dto/income.dto';
import { INCOME_INCLUDE, toIncomeDto, type IncomeRow } from './income.mapper';

@Injectable()
export class IncomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
    private readonly signer: UrlSigner,
    private readonly audit: AuditService,
  ) {}

  private view(row: IncomeRow): IncomeDto {
    const url = row.receiptFileId
      ? this.signer.sign(row.receiptFileId).url
      : null;
    return toIncomeDto(row, url);
  }

  async list(
    scope: Scope,
    query: IncomeQueryDto,
  ): Promise<PageResult<IncomeDto>> {
    if (query.branchId) await this.access.manage(scope, query.branchId);
    const where: Prisma.IncomeWhereInput = {
      AND: [
        scope.managedBranchFilter(),
        {
          branchId: query.branchId,
          categoryId: query.categoryId,
          receivedOn: {
            gte: query.from ? parseDate(query.from) : undefined,
            lte: query.to ? parseDate(query.to) : undefined,
          },
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.income.findMany({
        where,
        include: INCOME_INCLUDE,
        orderBy: [{ receivedOn: 'desc' }, { createdAt: 'desc' }],
        ...toSkipTake(query),
      }),
      this.prisma.income.count({ where }),
    ]);
    return toPageResult(
      rows.map((row) => this.view(row)),
      total,
      query,
    );
  }

  async get(scope: Scope, id: string): Promise<IncomeDto> {
    const row = await this.findManaged(scope, id);
    return this.view(row);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateIncomeDto,
  ): Promise<IncomeDto> {
    const branch = await this.access.manage(scope, dto.branchId);
    const row = await this.prisma.income.create({
      data: {
        schoolId: branch.schoolId,
        branchId: branch.id,
        categoryId: dto.categoryId,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        amountMinor: BigInt(dto.amountMinor),
        receivedOn: parseDate(dto.receivedOn),
        receiptFileId: dto.receiptFileId ?? null,
        notes: dto.notes?.trim() || null,
        createdById: user.id,
      },
      include: INCOME_INCLUDE,
    });
    const view = this.view(row);
    this.audit.stage({
      action: 'income.create',
      entityType: 'Income',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: view,
    });
    return view;
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateIncomeDto,
  ): Promise<IncomeDto> {
    const before = await this.findManaged(scope, id);
    await this.prisma.income.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        title: dto.title?.trim(),
        description:
          dto.description !== undefined
            ? dto.description?.trim() || null
            : undefined,
        amountMinor:
          dto.amountMinor !== undefined ? BigInt(dto.amountMinor) : undefined,
        receivedOn: dto.receivedOn ? parseDate(dto.receivedOn) : undefined,
        receiptFileId: dto.receiptFileId,
        notes: dto.notes !== undefined ? dto.notes.trim() || null : undefined,
      },
    });
    const after = await this.prisma.income.findUniqueOrThrow({
      where: { id },
      include: INCOME_INCLUDE,
    });
    const afterView = this.view(after);
    this.audit.stage({
      action: 'income.update',
      entityType: 'Income',
      entityId: id,
      schoolId: before.schoolId,
      branchId: before.branchId,
      before: this.view(before),
      after: afterView,
    });
    return afterView;
  }

  async remove(user: AuthUser, scope: Scope, id: string): Promise<void> {
    const row = await this.findManaged(scope, id);
    await this.prisma.income.delete({ where: { id } });
    this.audit.stage({
      action: 'income.delete',
      entityType: 'Income',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: this.view(row),
    });
  }

  private async findManaged(scope: Scope, id: string): Promise<IncomeRow> {
    const row = await this.prisma.income.findUnique({
      where: { id },
      include: INCOME_INCLUDE,
    });
    if (!row) throw notFound('Income');
    scope.assertManageBranch({ id: row.branchId, schoolId: row.schoolId });
    return row;
  }
}
