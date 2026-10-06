import { Injectable } from '@nestjs/common';
import { AccountProvisioner } from '../../core/accounts/account-provisioner';
import { AuditService } from '../../core/audit/audit.service';
import { normalizePhone } from '../../core/auth/identifier';
import { parseDate } from '../../core/common/dates';
import { conflict, invalid } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import { toPageResult } from '../../core/common/pagination/paginate';
import type { AuthUser } from '../../core/common/types/auth-user';
import { FileRefService } from '../../core/files/file-ref.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { DocumentsService } from '../documents/documents.service';
import {
  STAFF_ROLE_KEYS,
  type CreateStaffDto,
  type StaffQueryDto,
  type UpdateStaffDto,
} from './dto/staff-input.dto';
import type {
  CreatedStaffDto,
  StaffDetailDto,
  StaffSummaryDto,
} from './dto/staff.dto';
import { StaffAccessService } from './staff-access.service';
import { StaffMapper } from './staff.mapper';
import { StaffRepository, type StaffRow } from './staff.repository';

const onDuplicate = (error: unknown): never => {
  if ((error as { code?: string }).code === 'P2002')
    throw conflict('Employee number already exists');
  throw error;
};

@Injectable()
export class StaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: StaffRepository,
    private readonly access: StaffAccessService,
    private readonly mapper: StaffMapper,
    private readonly accounts: AccountProvisioner,
    private readonly files: FileRefService,
    private readonly documents: DocumentsService,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: StaffQueryDto,
  ): Promise<PageResult<StaffSummaryDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(
      rows.map((r) => this.mapper.toSummary(r)),
      total,
      query,
    );
  }

  async get(user: AuthUser, scope: Scope, id: string): Promise<StaffDetailDto> {
    return this.detail(user, await this.access.read(scope, id));
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateStaffDto,
  ): Promise<CreatedStaffDto> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId },
    });
    if (!branch) throw invalid('Branch not found');
    scope.assertManageBranch(branch);
    if (dto.photoFileId)
      await this.assertPhoto(user, branch.schoolId, dto.photoFileId);
    const roleKey =
      dto.roleKey ??
      (STAFF_ROLE_KEYS as readonly string[]).find(
        (k) => k === dto.designation,
      ) ??
      'TEACHER';

    const result = await this.prisma.$transaction(async (tx) => {
      const account = dto.createAccount
        ? await this.accounts.provision(tx, {
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            roleKey,
            scopeType: 'BRANCH',
            schoolId: branch.schoolId,
            branchId: branch.id,
            grantedById: user.id,
          })
        : null;
      if (
        account &&
        (await tx.staff.count({ where: { userId: account.userId } })) > 0
      )
        throw conflict('That login already has a staff record');
      const staff = await tx.staff
        .create({
          data: {
            schoolId: branch.schoolId,
            branchId: branch.id,
            userId: account?.userId,
            name: dto.name.trim(),
            email: dto.email?.toLowerCase(),
            phone: dto.phone ? normalizePhone(dto.phone) : undefined,
            employeeNo: dto.employeeNo,
            designation: dto.designation,
            joinDate: parseDate(dto.joinDate),
            cnic: dto.cnic,
            qualification: dto.qualification,
            photoFileId: dto.photoFileId,
            createdById: user.id,
          },
        })
        .catch(onDuplicate);
      return { staff, account };
    });
    if (result.account) await this.accounts.refresh(result.account.userId);
    const row = (await this.repository.findById(result.staff.id))!;
    const detail = await this.detail(user, row);
    this.audit.stage({
      action: 'staff.create',
      entityType: 'Staff',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: {
        ...detail,
        documents: undefined,
        accountCreated: result.account?.created ?? false,
      },
    });
    return {
      staff: detail,
      ...(result.account?.temporaryPassword && {
        temporaryPassword: result.account.temporaryPassword,
      }),
    };
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateStaffDto,
  ): Promise<StaffDetailDto> {
    const before = await this.access.manage(scope, id);
    if (dto.photoFileId)
      await this.assertPhoto(user, before.schoolId, dto.photoFileId);
    await this.prisma.staff
      .update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          email: dto.email?.toLowerCase(),
          phone: dto.phone ? normalizePhone(dto.phone) : undefined,
          employeeNo: dto.employeeNo,
          designation: dto.designation,
          joinDate: dto.joinDate ? parseDate(dto.joinDate) : undefined,
          cnic: dto.cnic,
          qualification: dto.qualification,
          photoFileId: dto.photoFileId,
          updatedById: user.id,
        },
      })
      .catch(onDuplicate);
    const row = (await this.repository.findById(id))!;
    this.audit.stage({
      action: 'staff.update',
      entityType: 'Staff',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: this.mapper.toDetail(before, [], true),
      after: this.mapper.toDetail(row, [], true),
    });
    return this.detail(user, row);
  }

  async detail(user: AuthUser, row: StaffRow): Promise<StaffDetailDto> {
    const documents = await this.documents.listForOwner('STAFF', row.id);
    return this.mapper.toDetail(
      row,
      documents,
      user.permissions.has('people.sensitive.view'),
    );
  }

  private async assertPhoto(user: AuthUser, schoolId: string, fileId: string) {
    await this.files.assertUsable(fileId, {
      schoolId,
      userId: user.id,
      purposes: ['STAFF_PHOTO'],
    });
  }
}
