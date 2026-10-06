import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import { invalid, notFound } from '../../../core/common/errors/errors';
import { schoolDate } from '../../../core/common/school-time';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { InvoiceLedgerService } from '../../finance-core/invoice-ledger.service';
import { LedgerService } from '../../finance-core/ledger.service';
import { systemFeeHead } from '../../finance-core/system-fee-heads';
import type { CreateSaleDto, SaleDto } from '../dto/sale.dto';
import { ItemLookup } from '../items/item-lookup';
import { assertUniqueItems } from '../purchasing/po-math';
import { MOVEMENT_INCLUDE, toMovementDto } from '../stock/movement.mapper';
import { StockLedger } from '../stock/stock-ledger';
import { priceSaleLines } from './sale-lines';

export const SALE_REF = 'Sale';

/** Uniform/book sales: ISSUE movements + an issued SALE invoice, atomically. */
@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly items: ItemLookup,
    private readonly stock: StockLedger,
    private readonly ledger: LedgerService,
    private readonly invoices: InvoiceLedgerService,
    private readonly people: SchoolPeopleService,
    private readonly audit: AuditService,
  ) {}

  async sell(
    user: AuthUser,
    scope: Scope,
    dto: CreateSaleDto,
  ): Promise<SaleDto> {
    const enrollment = await this.enrollmentOf(dto.studentId);
    scope.assertManageBranch({
      id: enrollment.branchId,
      schoolId: enrollment.schoolId,
    });
    assertUniqueItems(dto.lines);
    const items = await this.items.forSchool(
      enrollment.schoolId,
      dto.lines.map((l) => l.itemId),
    );
    const lines = priceSaleLines(items, dto.lines);
    const result = await this.prisma.$transaction(async (tx) => {
      await this.ledger.lockStudent(tx, dto.studentId);
      const head = await systemFeeHead(tx, enrollment.schoolId, 'STORE');
      const draft = await this.invoices.create(tx, {
        schoolId: enrollment.schoolId,
        branchId: enrollment.branchId,
        sessionId: enrollment.sessionId,
        studentId: dto.studentId,
        sectionId: enrollment.sectionId,
        classId: enrollment.section.classId,
        period: null,
        source: 'SALE',
        dueDate: parseDate(schoolDate()),
        createdById: user.id,
        lines: lines.map((l) => ({
          feeHeadId: head.id,
          description: l.description,
          amountMinor: l.amountMinor,
          refType: 'InventoryItem',
          refId: l.item.id,
        })),
      });
      const posted = [];
      for (const line of lines) {
        posted.push(
          await this.stock.post(tx, {
            schoolId: enrollment.schoolId,
            branchId: enrollment.branchId,
            itemId: line.item.id,
            type: 'ISSUE',
            quantity: -line.quantity,
            studentId: dto.studentId,
            refType: SALE_REF,
            refId: draft.id,
            createdById: user.id,
          }),
        );
      }
      const invoice = await this.invoices.issue(tx, draft.id, user.id);
      return { invoice, posted };
    });
    const { invoice, posted } = result;
    this.audit.stage({
      action: 'inventory.sale',
      entityType: 'Invoice',
      entityId: invoice.id,
      schoolId: invoice.schoolId,
      branchId: invoice.branchId,
      after: {
        invoiceNo: invoice.invoiceNo,
        studentId: dto.studentId,
        totalMinor: Number(invoice.totalMinor),
        lines: dto.lines,
      },
    });
    const rows = await this.prisma.stockMovement.findMany({
      where: { id: { in: posted.map((p) => p.movement.id) } },
      include: MOVEMENT_INCLUDE,
    });
    const balances = new Map(posted.map((p) => [p.movement.id, p.balance]));
    const names = await this.people.names([user.id]);
    return {
      invoiceId: invoice.id,
      invoiceNo: invoice.invoiceNo,
      totalMinor: Number(invoice.totalMinor),
      movements: rows.map((row) =>
        toMovementDto(row, names, balances.get(row.id)),
      ),
    };
  }

  /** The student's ACTIVE enrollment, else the latest one. */
  private async enrollmentOf(studentId: string) {
    const include = { section: { select: { classId: true } } };
    const enrollment =
      (await this.prisma.enrollment.findFirst({
        where: { studentId, status: 'ACTIVE' },
        include,
      })) ??
      (await this.prisma.enrollment.findFirst({
        where: { studentId },
        include,
        orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
      }));
    if (!enrollment) {
      const student = await this.prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true },
      });
      if (!student) throw notFound('Student');
      throw invalid('Student has no enrollment');
    }
    return enrollment;
  }
}
