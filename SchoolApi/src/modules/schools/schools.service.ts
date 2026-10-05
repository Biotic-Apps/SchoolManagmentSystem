import { Injectable } from '@nestjs/common';
import type { RecordStatus } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { invalid, notFound } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import { toPageResult } from '../../core/common/pagination/paginate';
import type { ListQueryDto } from '../../core/common/pagination/list-query.dto';
import type { AuthUser } from '../../core/common/types/auth-user';
import { UrlSigner } from '../../core/files/url-signer';
import { AccessCache } from '../../core/rbac/access/access-cache';
import type { Scope } from '../../core/rbac/scope/scope';
import type { CreateSchoolDto } from './dto/create-school.dto';
import type { SchoolDto } from './dto/school.dto';
import type { UpdateSchoolDto } from './dto/update-school.dto';
import { toSchoolDto } from './school.mapper';
import { SchoolsRepository, type SchoolRow } from './schools.repository';

@Injectable()
export class SchoolsService {
  constructor(
    private readonly repository: SchoolsRepository,
    private readonly signer: UrlSigner,
    private readonly access: AccessCache,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: ListQueryDto,
  ): Promise<PageResult<SchoolDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(
      rows.map((row) => this.toDto(row)),
      total,
      query,
    );
  }

  async get(scope: Scope, id: string): Promise<SchoolDto> {
    return this.toDto(await this.find(scope, id));
  }

  async create(user: AuthUser, dto: CreateSchoolDto): Promise<SchoolDto> {
    await this.assertLogo(dto.logoFileId);
    const row = await this.repository.create({ ...dto, createdById: user.id });
    const result = this.toDto(row);
    this.audit.stage({
      action: 'school.create',
      entityType: 'School',
      entityId: row.id,
      schoolId: row.id,
      after: result,
    });
    return result;
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateSchoolDto,
  ): Promise<SchoolDto> {
    const before = await this.find(scope, id);
    scope.assertManageSchool(id);
    await this.assertLogo(dto.logoFileId);
    const row = await this.repository.update(id, {
      ...dto,
      updatedById: user.id,
    });
    const result = this.toDto(row);
    this.audit.stage({
      action: 'school.update',
      entityType: 'School',
      entityId: id,
      schoolId: id,
      before: this.toDto(before),
      after: result,
    });
    return result;
  }

  async setStatus(
    user: AuthUser,
    scope: Scope,
    id: string,
    status: RecordStatus,
  ): Promise<SchoolDto> {
    const before = await this.find(scope, id);
    scope.assertManageSchool(id);
    const row = await this.repository.update(id, {
      status,
      updatedById: user.id,
    });
    await this.access.invalidateAllUsers();
    this.audit.stage({
      action: status === 'ARCHIVED' ? 'school.archive' : 'school.activate',
      entityType: 'School',
      entityId: id,
      schoolId: id,
      before: { status: before.status },
      after: { status },
    });
    return this.toDto(row);
  }

  private async find(scope: Scope, id: string): Promise<SchoolRow> {
    const row = await this.repository.findById(id);
    if (!row) throw notFound('School');
    scope.assertReadSchool(id);
    return row;
  }

  private async assertLogo(fileId?: string): Promise<void> {
    if (fileId && !(await this.repository.logoFile(fileId))) {
      throw invalid('logoFileId must reference an uploaded SCHOOL_LOGO file');
    }
  }

  private toDto(row: SchoolRow): SchoolDto {
    return toSchoolDto(row, (fileId) => this.signer.sign(fileId));
  }
}
