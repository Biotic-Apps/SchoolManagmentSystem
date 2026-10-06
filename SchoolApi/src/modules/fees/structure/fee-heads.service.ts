import { Injectable } from '@nestjs/common';
import type { FeeHead } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  forbidden,
  invalid,
} from '../../../core/common/errors/errors';
import { isPrismaKnownError } from '../../../core/common/errors/prisma-error.mapper';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SYSTEM_FEE_HEADS } from '../../finance-core/system-fee-heads';
import type {
  CreateFeeHeadDto,
  FeeHeadDto,
  FeeHeadQueryDto,
} from './dto/fee-head.dto';

export const toFeeHeadDto = (row: FeeHead): FeeHeadDto => ({
  id: row.id,
  schoolId: row.schoolId,
  code: row.code,
  name: row.name,
  kind: row.kind,
  refundable: row.refundable,
  system: row.system,
  status: row.status,
});

const RESERVED = new Set<string>(
  Object.values(SYSTEM_FEE_HEADS).map((h) => h.code),
);

/** School-wide fee heads (Tuition, Transport, …). */
@Injectable()
export class FeeHeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(scope: Scope, query: FeeHeadQueryDto): Promise<FeeHeadDto[]> {
    const schoolId = this.resolveSchool(scope, query.schoolId);
    scope.assertReadSchool(schoolId);
    const rows = await this.prisma.feeHead.findMany({
      where: { schoolId },
      orderBy: [{ system: 'asc' }, { name: 'asc' }],
    });
    return rows.map(toFeeHeadDto);
  }

  /** Members of the school with `fees.add` (accountants are branch-scoped). */
  async create(scope: Scope, dto: CreateFeeHeadDto): Promise<FeeHeadDto> {
    scope.assertReadSchool(dto.schoolId);
    if (scope.guardian) throw forbidden('Parents cannot create fee heads');
    const code = dto.code.trim().toUpperCase();
    if (RESERVED.has(code)) throw conflict(`Fee head code ${code} is reserved`);
    try {
      const row = await this.prisma.feeHead.create({
        data: {
          schoolId: dto.schoolId,
          code,
          name: dto.name.trim(),
          kind: dto.kind,
          refundable: dto.refundable,
        },
      });
      this.audit.stage({
        action: 'fee_head.create',
        entityType: 'FeeHead',
        entityId: row.id,
        schoolId: row.schoolId,
        after: toFeeHeadDto(row),
      });
      return toFeeHeadDto(row);
    } catch (error) {
      if (isPrismaKnownError(error) && error.code === 'P2002')
        throw conflict(`Fee head code ${code} already exists`);
      throw error;
    }
  }

  private resolveSchool(scope: Scope, schoolId?: string): string {
    if (schoolId) return schoolId;
    const schools = [...scope.memberSchoolIds];
    if (schools.length === 1) return schools[0];
    throw invalid('schoolId is required');
  }
}
