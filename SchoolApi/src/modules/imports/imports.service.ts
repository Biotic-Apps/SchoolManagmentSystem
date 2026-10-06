import { createHash, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { ImportKind } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { invalid, notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { StorageDriver } from '../../core/files/storage/storage-driver';
import { JobDispatcher } from '../../core/jobs/job-dispatcher';
import { QUEUES } from '../../core/jobs/queues';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { assertSessionOpen } from '../academic-sessions/session-lock';
import type {
  CreateImportDto,
  ImportCreatedDto,
  ImportDetailDto,
  ImportSummaryDto,
} from './dto/import.dto';
import { ImportAccessService } from './import-access.service';
import { toDetail, toSummary } from './import.mapper';
import { ImportKinds } from './kinds/import-kinds';
import {
  checkImportFile,
  IMPORT_MIME,
  type ImportUpload,
} from './parsing/read-file';
import { VALIDATE_IMPORT_JOB } from './pipeline/import-validate.processor';
import { buildTemplate } from './templates/template-builder';

const SHEET_NAMES: Record<ImportKind, string> = {
  STUDENTS: 'Students',
  GUARDIANS: 'Guardians',
  STAFF: 'Staff',
  OPENING_BALANCES: 'Opening balances',
  FEE_PLANS: 'Fee plans',
};

@Injectable()
export class ImportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
    private readonly jobs: JobDispatcher,
    private readonly kinds: ImportKinds,
    private readonly access: ImportAccessService,
    private readonly audit: AuditService,
  ) {}

  template(kind: ImportKind): Promise<Buffer> {
    const validator = this.kinds.get(kind).validator;
    return buildTemplate({
      sheetName: SHEET_NAMES[kind],
      columns: validator.columns,
      notes: validator.notes,
    });
  }

  async create(
    user: AuthUser,
    scope: Scope,
    upload: ImportUpload | undefined,
    dto: CreateImportDto,
  ): Promise<ImportCreatedDto> {
    const format = checkImportFile(upload);
    const file = upload!;
    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId },
    });
    if (!branch) throw notFound('Branch');
    scope.assertManageBranch(branch);
    const session = await this.prisma.academicSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session || session.branchId !== branch.id) {
      throw invalid('Session does not belong to the branch');
    }
    assertSessionOpen(session);

    const fileId = randomUUID();
    const now = new Date();
    const storageKey = `imports/${now.getUTCFullYear()}/${now.getUTCMonth() + 1}/${fileId}.${format}`;
    await this.storage.put(storageKey, file.buffer, IMPORT_MIME[format]);
    const fileName = file.originalname.slice(0, 200);
    const batch = await this.prisma.$transaction(async (tx) => {
      await tx.file.create({
        data: {
          id: fileId,
          schoolId: branch.schoolId,
          purpose: 'IMPORT',
          storageKey,
          originalName: fileName,
          mime: IMPORT_MIME[format],
          size: file.buffer.length,
          sha256: createHash('sha256').update(file.buffer).digest('hex'),
          uploadedById: user.id,
        },
      });
      return tx.importBatch.create({
        data: {
          schoolId: branch.schoolId,
          branchId: branch.id,
          sessionId: session.id,
          kind: dto.kind,
          fileId,
          fileName,
          createdById: user.id,
        },
      });
    });
    await this.jobs.dispatch(QUEUES.IMPORTS, VALIDATE_IMPORT_JOB, {
      importId: batch.id,
    });
    this.audit.stage({
      action: 'import.create',
      entityType: 'ImportBatch',
      entityId: batch.id,
      schoolId: branch.schoolId,
      branchId: branch.id,
      after: { kind: dto.kind, sessionId: session.id, fileId, fileName },
    });
    return { importId: batch.id };
  }

  async get(scope: Scope, id: string): Promise<ImportDetailDto> {
    return toDetail(await this.access.batch(scope, id));
  }

  /** Newest first, at most 100; managed branches only. */
  async list(scope: Scope, branchId?: string): Promise<ImportSummaryDto[]> {
    if (branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
      });
      if (!branch || !scope.canManageBranch(branch)) return [];
    }
    const rows = await this.prisma.importBatch.findMany({
      where: {
        ...scope.managedBranchFilter(),
        ...(branchId ? { branchId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return (await this.access.withPeople(rows)).map(toSummary);
  }
}
