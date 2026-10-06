import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AuditService } from '../../../core/audit/audit.service';
import { invalid, notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { BranchAccess } from '../../expenses/branch-access';
import type { CreateMovementDto, MovementDto } from '../dto/stock.dto';
import { MOVEMENT_INCLUDE, toMovementDto } from './movement.mapper';
import { StockLedger } from './stock-ledger';
import { signedQuantity, validateMovement } from './stock-rules';

export const TRANSFER_REF = 'StockTransfer';

/** Manual stock movements (receipts, issues, adjustments, transfers). */
@Injectable()
export class MovementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
    private readonly ledger: StockLedger,
    private readonly people: SchoolPeopleService,
    private readonly audit: AuditService,
  ) {}

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateMovementDto,
  ): Promise<MovementDto> {
    validateMovement(dto);
    const branch = await this.access.manage(scope, dto.branchId);
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: dto.itemId, schoolId: branch.schoolId },
    });
    if (!item) throw notFound('Inventory item');
    if (dto.studentId) await this.assertStudent(dto.studentId, branch.schoolId);
    const target = dto.toBranchId
      ? await this.access.find(dto.toBranchId)
      : null;
    if (target && target.schoolId !== branch.schoolId) {
      throw invalid('toBranchId must be a branch of the same school');
    }
    const outId = randomUUID();
    const inId = randomUUID();
    const base = {
      schoolId: branch.schoolId,
      itemId: item.id,
      issuedTo: dto.issuedTo?.trim() || null,
      studentId: dto.studentId ?? null,
      reason: dto.reason?.trim() || null,
      createdById: user.id,
    };
    const posted = await this.prisma.$transaction(async (tx) => {
      const main = await this.ledger.post(tx, {
        ...base,
        id: outId,
        branchId: branch.id,
        type: dto.type,
        quantity: signedQuantity(dto.type, dto.quantity),
        refType: target ? TRANSFER_REF : null,
        refId: target ? inId : null,
      });
      if (target) {
        await this.ledger.post(tx, {
          ...base,
          id: inId,
          branchId: target.id,
          type: 'TRANSFER_IN',
          quantity: dto.quantity,
          refType: TRANSFER_REF,
          refId: outId,
        });
      }
      return main;
    });
    this.audit.stage({
      action: `stock.${dto.type.toLowerCase()}`,
      entityType: 'StockMovement',
      entityId: posted.movement.id,
      schoolId: branch.schoolId,
      branchId: branch.id,
      after: {
        itemId: item.id,
        type: dto.type,
        quantity: posted.movement.quantity,
        toBranchId: target?.id ?? null,
        reason: base.reason,
        balance: posted.balance,
      },
    });
    const row = await this.prisma.stockMovement.findUniqueOrThrow({
      where: { id: posted.movement.id },
      include: MOVEMENT_INCLUDE,
    });
    const names = await this.people.names([user.id]);
    return toMovementDto(row, names, posted.balance);
  }

  private async assertStudent(studentId: string, schoolId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, schoolId },
      select: { id: true },
    });
    if (!student) throw notFound('Student');
  }
}
