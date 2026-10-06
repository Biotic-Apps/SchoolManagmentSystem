import { Injectable } from '@nestjs/common';
import type {
  Prisma,
  RecordStatus,
  Vendor,
} from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import { containsInsensitive } from '../../../core/common/search';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { BranchAccess } from '../branch-access';
import { onDuplicate } from '../unique-conflict';
import type { CreateVendorDto, VendorDto, VendorQueryDto } from './vendor.dto';

const toVendorDto = (row: Vendor): VendorDto => ({
  id: row.id,
  schoolId: row.schoolId,
  name: row.name,
  contactPerson: row.contactPerson,
  phone: row.phone,
  email: row.email,
  address: row.address,
  ntn: row.ntn,
  status: row.status,
  createdAt: row.createdAt.toISOString(),
});

/** School-wide vendor directory (unique name per school). */
@Injectable()
export class VendorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: VendorQueryDto,
  ): Promise<PageResult<VendorDto>> {
    const schoolId = await this.access.school(scope, query);
    const where: Prisma.VendorWhereInput = {
      schoolId,
      status: (query.status as RecordStatus | undefined) ?? 'ACTIVE',
      name: containsInsensitive(query.search),
    };
    const [rows, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        orderBy: { name: 'asc' },
        ...toSkipTake(query),
      }),
      this.prisma.vendor.count({ where }),
    ]);
    return toPageResult(rows.map(toVendorDto), total, query);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateVendorDto,
  ): Promise<VendorDto> {
    const schoolId = await this.access.school(scope, dto);
    const name = dto.name.trim();
    const row = await this.prisma.vendor
      .create({
        data: {
          schoolId,
          name,
          contactPerson: dto.contactPerson?.trim() || null,
          phone: dto.phone?.trim() || null,
          email: dto.email?.trim() || null,
          address: dto.address?.trim() || null,
          ntn: dto.ntn?.trim() || null,
          createdById: user.id,
        },
      })
      .catch(onDuplicate(`Vendor ${name} already exists`));
    const vendor = toVendorDto(row);
    this.audit.stage({
      action: 'vendor.create',
      entityType: 'Vendor',
      entityId: row.id,
      schoolId,
      after: vendor,
    });
    return vendor;
  }
}
