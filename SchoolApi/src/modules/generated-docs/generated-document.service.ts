import { Injectable } from '@nestjs/common';
import type {
  GeneratedDocument,
  GeneratedDocumentKind,
} from '../../generated/prisma/client';
import { UrlSigner } from '../../core/files/url-signer';
import { QUEUES } from '../../core/jobs/queues';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  AsyncTaskService,
  type TaskRequester,
} from '../tasks/async-task.service';

export const RENDER_DOCUMENT_JOB = 'documents.render';

export interface RenderJobInput {
  documentId: string;
}

export interface DocumentRequest {
  kind: GeneratedDocumentKind;
  entityId: string;
  schoolId: string;
  /** The file is stored as uploaded by this user (payslip: the staff member). */
  ownerUserId: string;
  /** New version even when one is ready (e.g. reissue, changed data). */
  fresh?: boolean;
}

export interface DocumentView {
  status: 'PENDING' | 'READY' | 'FAILED';
  fileUrl: string | null;
  generatedAt: string | null;
  version: number;
}

/** Versioned PDFs rendered on the `documents` queue; poll via `/jobs/:id`. */
@Injectable()
export class GeneratedDocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasks: AsyncTaskService,
    private readonly signer: UrlSigner,
  ) {}

  /** Returns a pollable job; reuses the latest ready version unless `fresh`. */
  async request(
    requester: TaskRequester,
    request: DocumentRequest,
  ): Promise<{ jobId: string; documentId: string }> {
    const latest = await this.latest(request.kind, request.entityId);
    if (latest && !request.fresh && latest.status === 'READY') {
      const jobId = await this.tasks.completed(
        requester,
        `${QUEUES.DOCUMENTS}/${RENDER_DOCUMENT_JOB}`,
        { fileId: latest.fileId },
        request.schoolId,
      );
      return { jobId, documentId: latest.id };
    }
    const document =
      latest && !request.fresh && latest.status === 'PENDING'
        ? latest
        : await this.prisma.generatedDocument.create({
            data: {
              schoolId: request.schoolId,
              kind: request.kind,
              entityId: request.entityId,
              version: (latest?.version ?? 0) + 1,
              ownerUserId: request.ownerUserId,
            },
          });
    const jobId = await this.tasks.enqueue<RenderJobInput>(requester, {
      queue: QUEUES.DOCUMENTS,
      name: RENDER_DOCUMENT_JOB,
      data: { documentId: document.id },
      schoolId: request.schoolId,
    });
    return { jobId, documentId: document.id };
  }

  latest(
    kind: GeneratedDocumentKind,
    entityId: string,
  ): Promise<GeneratedDocument | null> {
    return this.prisma.generatedDocument.findFirst({
      where: { kind, entityId },
      orderBy: { version: 'desc' },
    });
  }

  async latestMany(
    kind: GeneratedDocumentKind,
    entityIds: string[],
  ): Promise<Map<string, GeneratedDocument>> {
    const rows = await this.prisma.generatedDocument.findMany({
      where: { kind, entityId: { in: entityIds } },
      orderBy: { version: 'asc' },
    });
    return new Map(rows.map((row) => [row.entityId, row]));
  }

  view(document: GeneratedDocument | null): DocumentView | null {
    if (!document) return null;
    return {
      status: document.status,
      fileUrl: document.fileId ? this.signer.sign(document.fileId).url : null,
      generatedAt: document.generatedAt?.toISOString() ?? null,
      version: document.version,
    };
  }
}
