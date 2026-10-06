import { Injectable } from '@nestjs/common';
import type { Concession, Prisma } from '../../../generated/prisma/client';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { fullName } from '../../students/student.mapper';
import { FeeAccessService } from '../shared/fee-access.service';
import type { ConcessionDto, ConcessionQueryDto } from './dto/concession.dto';

/** Concession lists (parents: own children only). */
@Injectable()
export class ConcessionReader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly people: SchoolPeopleService,
    private readonly access: FeeAccessService,
  ) {}

  async list(
    scope: Scope,
    query: ConcessionQueryDto,
  ): Promise<PageResult<ConcessionDto>> {
    if (query.branchId && !scope.guardian)
      await this.access.readBranch(scope, query.branchId);
    const visible: Prisma.ConcessionWhereInput = scope.guardian
      ? { studentId: { in: [...scope.studentIds] } }
      : scope.branchFilter();
    const where: Prisma.ConcessionWhereInput = {
      AND: [
        visible,
        {
          studentId: query.studentId,
          branchId: query.branchId,
          status: query.status,
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.concession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.concession.count({ where }),
    ]);
    return toPageResult(await this.toDtos(rows), total, query);
  }

  async toDtos(rows: Concession[]): Promise<ConcessionDto[]> {
    const [students, heads, users] = await Promise.all([
      this.prisma.student.findMany({
        where: { id: { in: [...new Set(rows.map((r) => r.studentId))] } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNo: true,
        },
      }),
      this.prisma.feeHead.findMany({
        where: {
          id: {
            in: rows.map((r) => r.feeHeadId).filter((id): id is string => !!id),
          },
        },
        select: { id: true, name: true },
      }),
      this.people.names(rows.map((r) => r.requestedById)),
    ]);
    const studentById = new Map(students.map((s) => [s.id, s]));
    const headById = new Map(heads.map((h) => [h.id, h]));
    return rows.map((row) => {
      const student = studentById.get(row.studentId);
      return {
        id: row.id,
        branchId: row.branchId,
        student: {
          id: row.studentId,
          name: student ? fullName(student) : '',
          admissionNo: student?.admissionNo ?? '',
        },
        feeHead: row.feeHeadId ? (headById.get(row.feeHeadId) ?? null) : null,
        type: row.type,
        value: Number(row.value),
        from: row.fromPeriod,
        to: row.toPeriod,
        reason: row.reason,
        estimateMinor: Number(row.estimateMinor),
        status: row.status,
        approvalId: row.approvalId,
        requestedBy: {
          id: row.requestedById,
          name: users.get(row.requestedById) ?? '',
        },
        decidedAt: row.decidedAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
      };
    });
  }
}
