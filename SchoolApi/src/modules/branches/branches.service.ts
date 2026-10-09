import { Injectable } from '@nestjs/common';
import type { RecordStatus } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { forbidden, invalid, notFound } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import { toPageResult } from '../../core/common/pagination/paginate';
import { toJson } from '../../core/common/prisma-json';
import type { AuthUser } from '../../core/common/types/auth-user';
import { AccessCache } from '../../core/rbac/access/access-cache';
import type { Scope } from '../../core/rbac/scope/scope';
import { toBranchDto } from './branch.mapper';
import { BranchesRepository, type BranchRow } from './branches.repository';
import type { BranchDto } from './dto/branch.dto';
import type { BranchQueryDto } from './dto/branch-query.dto';
import type { CreateBranchDto } from './dto/create-branch.dto';
import type { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchSettingsRepository } from './settings/branch-settings.repository';
import { withStaffDefaults } from './timings/branch-timings';

@Injectable()
export class BranchesService {
  constructor(
    private readonly repository: BranchesRepository,
    private readonly access: AccessCache,
    private readonly audit: AuditService,
    private readonly settings: BranchSettingsRepository,
  ) {}

  async list(
    scope: Scope,
    query: BranchQueryDto,
  ): Promise<PageResult<BranchDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(rows.map(toBranchDto), total, query);
  }

  async get(scope: Scope, id: string): Promise<BranchDto> {
    return toBranchDto(await this.find(scope, id));
  }

  /** Branch visible in scope (shared with settings and principal flows). */
  async find(scope: Scope, id: string): Promise<BranchRow> {
    const row = await this.repository.findById(id);
    if (!row) throw notFound('Branch');
    scope.assertReadBranch(row);
    return row;
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateBranchDto,
  ): Promise<BranchDto> {
    if ((await this.repository.schoolExists(dto.schoolId)) === 0)
      throw invalid('School does not exist');
    scope.assertManageSchool(dto.schoolId);
    const { timings, ...rest } = dto;
    const row = await this.repository.create({
      ...rest,
      timings: timings ? toJson(withStaffDefaults(timings)) : undefined,
      createdById: user.id,
    });
    if (timings)
      await this.settings.save(
        row.id,
        { 'attendance.lockTime': timings.attendanceLockAt },
        user.id,
      );
    const result = toBranchDto(row);
    this.audit.stage({
      action: 'branch.create',
      entityType: 'Branch',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.id,
      after: result,
    });
    return result;
  }

  /** School managers edit everything; branch principals only contacts/timings/days. */
  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateBranchDto,
  ): Promise<BranchDto> {
    const before = await this.find(scope, id);
    scope.assertManageBranch(before);
    if (
      !scope.canManageSchool(before.schoolId) &&
      (dto.name !== undefined || dto.code !== undefined)
    ) {
      throw forbidden(
        'Only school administrators can change branch name or code',
      );
    }
    const { timings, ...rest } = dto;
    const row = await this.repository.update(id, {
      ...rest,
      ...(timings && { timings: toJson(withStaffDefaults(timings)) }),
      updatedById: user.id,
    });
    // The attendance lock job reads this setting; keep it equal to the timing.
    if (timings)
      await this.settings.save(
        id,
        { 'attendance.lockTime': timings.attendanceLockAt },
        user.id,
      );
    const result = toBranchDto(row);
    this.audit.stage({
      action: 'branch.update',
      entityType: 'Branch',
      entityId: id,
      schoolId: row.schoolId,
      branchId: id,
      before: toBranchDto(before),
      after: result,
    });
    return result;
  }

  async setStatus(
    user: AuthUser,
    scope: Scope,
    id: string,
    status: RecordStatus,
  ): Promise<BranchDto> {
    const before = await this.find(scope, id);
    scope.assertManageSchool(before.schoolId);
    const row = await this.repository.update(id, {
      status,
      updatedById: user.id,
    });
    await this.access.invalidateAllUsers();
    this.audit.stage({
      action: status === 'ARCHIVED' ? 'branch.archive' : 'branch.activate',
      entityType: 'Branch',
      entityId: id,
      schoolId: row.schoolId,
      branchId: id,
      before: { status: before.status },
      after: { status },
    });
    return toBranchDto(row);
  }
}
