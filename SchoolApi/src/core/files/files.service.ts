import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { File, FilePurpose } from '../../generated/prisma/client';
import { AuditService } from '../audit/audit.service';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code.enum';
import { invalid, notFound } from '../common/errors/errors';
import type { AuthUser } from '../common/types/auth-user';
import type { Scope } from '../rbac/scope/scope';
import type { FileUploadedDto } from './dto/file-uploaded.dto';
import { canAccessFile } from './file-access.policy';
import { FilesRepository } from './files.repository';
import { StorageDriver } from './storage/storage-driver';
import { UploadPipeline } from './upload-pipeline';
import type { UploadCandidate } from './upload-policy';
import { UrlSigner, type SignedUrl } from './url-signer';

/** INFECTED (or a failed scan) is never served. PENDING = not scanned. */
export function assertServable(file: Pick<File, 'scanStatus'>): void {
  if (file.scanStatus === 'INFECTED' || file.scanStatus === 'FAILED') {
    throw new AppError(
      ErrorCode.FILE_UNAVAILABLE,
      'File is unavailable (failed antivirus check)',
    );
  }
}

@Injectable()
export class FilesService {
  constructor(
    private readonly repository: FilesRepository,
    private readonly storage: StorageDriver,
    private readonly signer: UrlSigner,
    private readonly audit: AuditService,
    private readonly pipeline: UploadPipeline,
  ) {}

  async upload(
    user: AuthUser,
    scope: Scope,
    file: UploadCandidate | undefined,
    purpose: FilePurpose,
  ): Promise<FileUploadedDto> {
    if (!file) throw invalid('file is required');
    const id = randomUUID();
    const schools = [...scope.memberSchoolIds];
    const schoolId = schools.length === 1 ? schools[0] : null;
    const prepared = await this.pipeline.prepare(file, purpose, schoolId, id);
    const now = new Date();
    const storageKey = `${now.getUTCFullYear()}/${now.getUTCMonth() + 1}/${id}.${prepared.extension}`;
    await this.storage.put(storageKey, prepared.buffer, prepared.mime);

    const row = await this.repository.create({
      id,
      schoolId,
      purpose,
      storageKey,
      originalName: prepared.originalName,
      mime: prepared.mime,
      size: prepared.buffer.length,
      sha256: prepared.sha256,
      uploadedById: user.id,
      scanStatus: prepared.scanStatus,
    });
    this.audit.stage({
      action: 'file.upload',
      entityType: 'File',
      entityId: row.id,
      schoolId: row.schoolId,
      after: {
        purpose,
        mime: row.mime,
        size: row.size,
        sha256: row.sha256,
        scanStatus: row.scanStatus,
      },
    });
    return {
      id: row.id,
      url: this.signer.sign(row.id).url,
      mime: row.mime,
      size: row.size,
    };
  }

  /** See canAccessFile; anything else looks like 404. */
  async signedUrl(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<SignedUrl> {
    const file = await this.repository.findActive(id);
    if (!file) throw notFound('File');
    const managedBranchSchoolIds = scope.global
      ? new Set<string>()
      : await this.repository.schoolsOfBranches([...scope.branchIds]);
    const allowed = canAccessFile(file, {
      userId: user.id,
      permissions: user.permissions,
      scope,
      managedBranchSchoolIds,
    });
    if (!allowed) throw notFound('File');
    if (!(await this.importBranchAllowed(file, user.id, scope))) {
      throw notFound('File');
    }
    assertServable(file);
    return this.signer.sign(file.id);
  }

  /**
   * Import spreadsheets hold bulk PII: besides the import permission the
   * caller must manage the branch the import belongs to (or be the uploader).
   */
  private async importBranchAllowed(
    file: { id: string; purpose: string; uploadedById: string },
    userId: string,
    scope: Scope,
  ): Promise<boolean> {
    if (file.purpose !== 'IMPORT') return true;
    if (file.uploadedById === userId || scope.global) return true;
    const batch = await this.repository.importBranchOf(file.id);
    return (
      batch !== null &&
      scope.canManageBranch({ id: batch.branchId, schoolId: batch.schoolId })
    );
  }

  async open(id: string, exp: number, sig: string) {
    if (!this.signer.verify(id, exp, sig)) throw notFound('File');
    const file = await this.repository.findActive(id);
    if (!file) throw notFound('File');
    assertServable(file);
    return { file, stream: await this.storage.read(file.storageKey) };
  }
}
