import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { forbiddenScope, notFound } from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import { containsInsensitive } from '../../../core/common/search';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { FeeAccessService } from '../shared/fee-access.service';
import type { InvoiceDto } from './dto/invoice.dto';
import type { InvoiceQueryDto } from './dto/invoice-input.dto';
import {
  INVOICE_INCLUDE,
  toInvoiceDto,
  type InvoiceRow,
  type SectionNames,
} from './invoice.mapper';

/** Invoice reads: parents see their children's issued invoices only. */
@Injectable()
export class InvoiceReader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FeeAccessService,
  ) {}

  async list(
    scope: Scope,
    query: InvoiceQueryDto,
  ): Promise<PageResult<InvoiceDto>> {
    if (query.branchId && !scope.guardian) {
      await this.access.readBranch(scope, query.branchId);
    }
    const search = containsInsensitive(query.search);
    const filters: Prisma.InvoiceWhereInput = {
      branchId: query.branchId,
      period: query.period,
      classId: query.classId,
      studentId: query.studentId,
      status: query.status,
    };
    const matches: Prisma.InvoiceWhereInput = search
      ? {
          OR: [
            { invoiceNo: search },
            { student: { firstName: search } },
            { student: { lastName: search } },
            { student: { admissionNo: search } },
          ],
        }
      : {};
    // AND keeps the visibility rules from being overridden by filters.
    const where: Prisma.InvoiceWhereInput = {
      AND: [this.visible(scope), filters, matches],
    };
    const [rows, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: INVOICE_INCLUDE,
        orderBy: [{ dueDate: 'desc' }, { invoiceNo: 'desc' }],
        ...toSkipTake(query),
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return toPageResult(await this.toDtos(rows), total, query);
  }

  /** One invoice the caller may read (parents: own child, not DRAFT → 404). */
  async read(scope: Scope, id: string): Promise<InvoiceRow> {
    const row = await this.find(id);
    if (scope.guardian) {
      if (!scope.canAccessStudent(row.studentId) || row.status === 'DRAFT')
        throw notFound('Invoice');
      return row;
    }
    if (!scope.canReadBranch({ id: row.branchId, schoolId: row.schoolId }))
      throw forbiddenScope();
    return row;
  }

  async find(id: string): Promise<InvoiceRow> {
    const row = await this.prisma.invoice.findUnique({
      where: { id },
      include: INVOICE_INCLUDE,
    });
    if (!row) throw notFound('Invoice');
    return row;
  }

  async dto(id: string): Promise<InvoiceDto> {
    return (await this.toDtos([await this.find(id)]))[0];
  }

  async toDtos(rows: InvoiceRow[]): Promise<InvoiceDto[]> {
    const sectionIds = [
      ...new Set(rows.map((r) => r.sectionId).filter((s): s is string => !!s)),
    ];
    const sections = await this.prisma.section.findMany({
      where: { id: { in: sectionIds } },
      select: { id: true, name: true, schoolClass: { select: { name: true } } },
    });
    const names = new Map<string, SectionNames>(
      sections.map((s) => [
        s.id,
        { className: s.schoolClass.name, sectionName: s.name },
      ]),
    );
    return rows.map((row) => toInvoiceDto(row, names));
  }

  private visible(scope: Scope): Prisma.InvoiceWhereInput {
    if (scope.guardian) {
      return {
        studentId: { in: [...scope.studentIds] },
        status: { not: 'DRAFT' },
      };
    }
    return scope.branchFilter();
  }
}
