import { Injectable } from '@nestjs/common';
import type {
  DocumentOwnerType,
  DocumentStatus,
} from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { conflict, forbidden, notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { FileRefService } from '../../core/files/file-ref.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { DocumentMapper } from './document.mapper';
import {
  DocumentOwnerRegistry,
  type DocumentOwner,
  type OwnerAccess,
} from './document-owner.registry';
import { DocumentsRepository, type DocumentRow } from './documents.repository';
import type { CreateDocumentDto } from './dto/document-input.dto';
import type { DocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly repository: DocumentsRepository,
    private readonly owners: DocumentOwnerRegistry,
    private readonly files: FileRefService,
    private readonly mapper: DocumentMapper,
    private readonly audit: AuditService,
  ) {}

  async list(
    user: AuthUser,
    scope: Scope,
    ownerType: DocumentOwnerType,
    ownerId: string,
  ): Promise<DocumentDto[]> {
    await this.owner(user, scope, ownerType, ownerId, 'view');
    return this.listForOwner(ownerType, ownerId);
  }

  /** No access check: callers have already authorised the owner. */
  async listForOwner(
    ownerType: DocumentOwnerType,
    ownerId: string,
  ): Promise<DocumentDto[]> {
    const rows = await this.repository.listByOwner(ownerType, ownerId);
    return rows.map((row) => this.mapper.toDto(row));
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateDocumentDto,
  ): Promise<DocumentDto> {
    const owner = await this.owner(
      user,
      scope,
      dto.ownerType,
      dto.ownerId,
      'edit',
    );
    await this.files.assertUsable(dto.fileId, {
      schoolId: owner.schoolId,
      userId: user.id,
      purposes: ['DOCUMENT', 'STUDENT_PHOTO', 'STAFF_PHOTO'],
    });
    const row = await this.repository.create({
      schoolId: owner.schoolId,
      ownerType: dto.ownerType,
      ownerId: dto.ownerId,
      docType: dto.docType,
      fileId: dto.fileId,
      note: dto.note,
      uploadedById: user.id,
    });
    await this.owners
      .get(dto.ownerType)
      .afterStatusChange?.(dto.ownerId, row.status);
    return this.audited('document.upload', owner, undefined, row);
  }

  verify(user: AuthUser, scope: Scope, id: string, note?: string) {
    return this.decide(user, scope, id, 'VERIFIED', note);
  }

  reject(user: AuthUser, scope: Scope, id: string, reason: string) {
    return this.decide(user, scope, id, 'REJECTED', reason);
  }

  private async decide(
    user: AuthUser,
    scope: Scope,
    id: string,
    status: DocumentStatus,
    note?: string,
  ): Promise<DocumentDto> {
    const before = await this.repository.findById(id);
    if (!before) throw notFound('Document');
    const permission =
      before.ownerType === 'STAFF' ? 'staff.edit' : 'students.edit';
    if (!user.permissions.has(permission)) throw forbidden();
    const owner = await this.owners
      .get(before.ownerType)
      .resolve(scope, before.ownerId, 'edit');
    if (before.status !== 'UPLOADED')
      throw conflict(`Document is already ${before.status.toLowerCase()}`);
    const row = await this.repository.update(id, {
      status,
      note: note ?? before.note,
      verifiedById: user.id,
      verifiedAt: new Date(),
    });
    await this.owners
      .get(before.ownerType)
      .afterStatusChange?.(before.ownerId, status);
    return this.audited(`document.${status.toLowerCase()}`, owner, before, row);
  }

  private async owner(
    user: AuthUser,
    scope: Scope,
    ownerType: DocumentOwnerType,
    ownerId: string,
    access: OwnerAccess,
  ): Promise<DocumentOwner> {
    const resolver = this.owners.get(ownerType);
    if (!user.permissions.has(`${resolver.module}.${access}`))
      throw forbidden();
    return resolver.resolve(scope, ownerId, access);
  }

  private audited(
    action: string,
    owner: DocumentOwner,
    before: DocumentRow | undefined,
    after: DocumentRow,
  ): DocumentDto {
    const dto = this.mapper.toDto(after);
    const snapshot = (row: DocumentRow) => ({
      ownerType: row.ownerType,
      ownerId: row.ownerId,
      docType: row.docType,
      fileId: row.fileId,
      status: row.status,
      note: row.note,
    });
    this.audit.stage({
      action,
      entityType: 'Document',
      entityId: after.id,
      schoolId: owner.schoolId,
      branchId: owner.branchId,
      before: before && snapshot(before),
      after: snapshot(after),
    });
    return dto;
  }
}
