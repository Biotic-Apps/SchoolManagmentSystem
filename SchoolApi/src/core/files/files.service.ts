import { createHash, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { FilePurpose } from '../../generated/prisma/client';
import { AuditService } from '../audit/audit.service';
import { invalid, notFound } from '../common/errors/errors';
import type { AuthUser } from '../common/types/auth-user';
import type { Scope } from '../rbac/scope/scope';
import type { FileUploadedDto } from './dto/file-uploaded.dto';
import { FilesRepository } from './files.repository';
import { StorageDriver } from './storage/storage-driver';
import { checkUpload, type UploadCandidate } from './upload-policy';
import { UrlSigner, type SignedUrl } from './url-signer';

const IMAGE_PURPOSES = new Set<FilePurpose>([
  'SCHOOL_LOGO',
  'STUDENT_PHOTO',
  'STAFF_PHOTO',
]);

@Injectable()
export class FilesService {
  constructor(
    private readonly repository: FilesRepository,
    private readonly storage: StorageDriver,
    private readonly signer: UrlSigner,
    private readonly audit: AuditService,
  ) {}

  async upload(
    user: AuthUser,
    scope: Scope,
    file: UploadCandidate | undefined,
    purpose: FilePurpose,
  ): Promise<FileUploadedDto> {
    if (!file) throw invalid('file is required');
    const extension = checkUpload(file, IMAGE_PURPOSES.has(purpose));
    const id = randomUUID();
    const now = new Date();
    const storageKey = `${now.getUTCFullYear()}/${now.getUTCMonth() + 1}/${id}.${extension}`;
    await this.storage.put(storageKey, file.buffer, file.mimetype);

    const schools = [...scope.memberSchoolIds];
    const row = await this.repository.create({
      id,
      schoolId: schools.length === 1 ? schools[0] : null,
      purpose,
      storageKey,
      originalName: file.originalname.slice(0, 200),
      mime: file.mimetype,
      size: file.size,
      sha256: createHash('sha256').update(file.buffer).digest('hex'),
      uploadedById: user.id,
    });
    this.audit.stage({
      action: 'file.upload',
      entityType: 'File',
      entityId: row.id,
      schoolId: row.schoolId,
      after: { purpose, mime: row.mime, size: row.size, sha256: row.sha256 },
    });
    return {
      id: row.id,
      url: this.signer.sign(row.id).url,
      mime: row.mime,
      size: row.size,
    };
  }

  /** Uploader, or anyone who can read the owning school. */
  async signedUrl(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<SignedUrl> {
    const file = await this.repository.findActive(id);
    const allowed =
      file &&
      (file.uploadedById === user.id ||
        scope.global ||
        (file.schoolId !== null && scope.canReadSchool(file.schoolId)));
    if (!allowed) throw notFound('File');
    return this.signer.sign(file.id);
  }

  async open(id: string, exp: number, sig: string) {
    if (!this.signer.verify(id, exp, sig)) throw notFound('File');
    const file = await this.repository.findActive(id);
    if (!file) throw notFound('File');
    return { file, stream: await this.storage.read(file.storageKey) };
  }
}
