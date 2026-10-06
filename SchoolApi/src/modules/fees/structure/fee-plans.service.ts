import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  forbidden,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import { isPrismaKnownError } from '../../../core/common/errors/prisma-error.mapper';
import { toJson } from '../../../core/common/prisma-json';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { FeeAccessService } from '../shared/fee-access.service';
import { toSnapshotJson } from '../shared/plan-snapshot';
import type {
  CreateFeePlanDto,
  FeePlanDto,
  FeePlanItemInputDto,
  UpdateFeePlanDto,
} from './dto/fee-plan.dto';
import { FeePlanReader } from './fee-plan-reader.service';
import { FEE_PLAN_INCLUDE } from './fee-plan.mapper';

const itemRows = (items: FeePlanItemInputDto[]) =>
  items.map((item) => ({
    feeHeadId: item.feeHeadId,
    amountMinor: BigInt(item.amountMinor),
    frequency: item.frequency,
    dueDay: item.dueDay,
  }));

const uniqueName = (error: unknown) =>
  isPrismaKnownError(error) && error.code === 'P2002'
    ? conflict('A plan with this name already exists for the class')
    : error;

/**
 * Fee plans per class and session. Edits make the plan a DRAFT (revision + 1)
 * while `approvedSnapshot` keeps billing the last approved version.
 */
@Injectable()
export class FeePlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reader: FeePlanReader,
    private readonly access: FeeAccessService,
    private readonly audit: AuditService,
  ) {}

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateFeePlanDto,
  ): Promise<FeePlanDto> {
    const branch = await this.access.manageBranch(scope, dto.branchId);
    const session = await this.prisma.academicSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session || session.branchId !== branch.id)
      throw notFound('Academic session');
    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id: dto.classId },
    });
    if (!schoolClass || schoolClass.schoolId !== branch.schoolId)
      throw notFound('Class');
    await this.reader.assertItems(branch.schoolId, dto.items);
    const row = await this.prisma.feePlan
      .create({
        data: {
          schoolId: branch.schoolId,
          branchId: branch.id,
          sessionId: session.id,
          classId: schoolClass.id,
          name: dto.name.trim(),
          lateFeeMinor: dto.lateFee ? BigInt(dto.lateFee.amountMinor) : null,
          lateFeeAfterDays: dto.lateFee?.afterDays ?? null,
          createdById: user.id,
          items: { create: itemRows(dto.items) },
        },
        include: FEE_PLAN_INCLUDE,
      })
      .catch((error: unknown) => {
        throw uniqueName(error);
      });
    this.audit.stage({
      action: 'fee_plan.create',
      entityType: 'FeePlan',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: { name: row.name, items: dto.items, lateFee: dto.lateFee },
    });
    return (await this.reader.toDtos([row]))[0];
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateFeePlanDto,
  ): Promise<FeePlanDto> {
    const plan = await this.reader.find(id);
    await this.access.manageBranch(scope, plan.branchId);
    if (plan.status === 'ARCHIVED') throw conflict('Plan is archived');
    if (dto.items) await this.reader.assertItems(plan.schoolId, dto.items);
    const lateFee =
      dto.lateFee === undefined
        ? {}
        : {
            lateFeeMinor: dto.lateFee ? BigInt(dto.lateFee.amountMinor) : null,
            lateFeeAfterDays: dto.lateFee?.afterDays ?? null,
          };
    const row = await this.prisma
      .$transaction(async (tx) => {
        if (dto.items) {
          await tx.feePlanItem.deleteMany({ where: { planId: id } });
          await tx.feePlanItem.createMany({
            data: itemRows(dto.items).map((item) => ({ ...item, planId: id })),
          });
        }
        return tx.feePlan.update({
          where: { id },
          data: {
            name: dto.name?.trim(),
            ...lateFee,
            status: 'DRAFT',
            revision: { increment: 1 },
            updatedById: user.id,
          },
          include: FEE_PLAN_INCLUDE,
        });
      })
      .catch((error: unknown) => {
        throw uniqueName(error);
      });
    this.audit.stage({
      action: 'fee_plan.update',
      entityType: 'FeePlan',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: { revision: plan.revision, status: plan.status },
      after: { revision: row.revision, ...dto },
    });
    return (await this.reader.toDtos([row]))[0];
  }

  /** Four-eyes: the creator / last editor cannot approve (403). */
  async approve(user: AuthUser, scope: Scope, id: string): Promise<FeePlanDto> {
    const plan = await this.reader.find(id);
    await this.access.manageBranch(scope, plan.branchId);
    if (plan.status !== 'DRAFT')
      throw conflict('Only a draft plan can be approved');
    if (plan.createdById === user.id || plan.updatedById === user.id)
      throw forbidden('The creator or last editor cannot approve the plan');
    if (plan.items.length === 0) throw invalid('The plan has no items');
    const lateFee =
      plan.lateFeeMinor !== null && plan.lateFeeAfterDays !== null
        ? {
            amountMinor: Number(plan.lateFeeMinor),
            afterDays: plan.lateFeeAfterDays,
          }
        : null;
    const snapshot = toSnapshotJson(plan.revision, plan.items, lateFee);
    const now = new Date();
    const updated = await this.prisma.feePlan.updateMany({
      where: { id, status: 'DRAFT', revision: plan.revision },
      data: {
        status: 'APPROVED',
        approvedSnapshot: toJson(snapshot),
        approvedById: user.id,
        approvedAt: now,
      },
    });
    if (updated.count === 0) throw conflict('The plan changed; reload it');
    this.audit.stage({
      action: 'fee_plan.approve',
      entityType: 'FeePlan',
      entityId: id,
      schoolId: plan.schoolId,
      branchId: plan.branchId,
      after: snapshot,
    });
    return (await this.reader.toDtos([await this.reader.find(id)]))[0];
  }
}
