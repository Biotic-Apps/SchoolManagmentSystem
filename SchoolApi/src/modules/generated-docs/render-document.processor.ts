import { createHash } from 'node:crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import type {
  FilePurpose,
  GeneratedDocumentKind,
} from '../../generated/prisma/client';
import { StorageDriver } from '../../core/files/storage/storage-driver';
import type { JobProcessor } from '../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../core/jobs/job-processor.registry';
import { QUEUES } from '../../core/jobs/queues';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  AsyncTaskService,
  type TaskJobData,
} from '../tasks/async-task.service';
import { DocumentRendererRegistry } from './document-renderer';
import {
  RENDER_DOCUMENT_JOB,
  type RenderJobInput,
} from './generated-document.service';

const PURPOSE: Record<GeneratedDocumentKind, FilePurpose> = {
  REPORT_CARD: 'REPORT_CARD',
  CHALLAN: 'CHALLAN',
  RECEIPT: 'RECEIPT',
  RECEIPT_THERMAL: 'RECEIPT',
  PAYSLIP: 'PAYSLIP',
  CERTIFICATE: 'CERTIFICATE',
};

/** Renders one generated document into file storage (idempotent per version). */
@Injectable()
export class RenderDocumentProcessor
  implements JobProcessor<TaskJobData<RenderJobInput>>, OnModuleInit
{
  readonly queue = QUEUES.DOCUMENTS;
  readonly name = RENDER_DOCUMENT_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly renderers: DocumentRendererRegistry,
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
    private readonly tasks: AsyncTaskService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  process(input: TaskJobData<RenderJobInput>): Promise<void> {
    return this.tasks.track(input.taskId, async () => {
      try {
        return { fileId: await this.render(input.documentId) };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await this.prisma.generatedDocument.update({
          where: { id: input.documentId },
          data: { status: 'FAILED', error: message.slice(0, 500) },
        });
        throw error;
      }
    });
  }

  private async render(documentId: string): Promise<string> {
    const document = await this.prisma.generatedDocument.findUniqueOrThrow({
      where: { id: documentId },
    });
    if (document.status === 'READY' && document.fileId) return document.fileId;
    const rendered = await this.renderers
      .get(document.kind)
      .render(document.entityId, document.version);
    const now = new Date();
    const storageKey = `generated/${document.kind.toLowerCase()}/${now.getUTCFullYear()}/${document.id}.pdf`;
    await this.storage.put(storageKey, rendered.buffer, 'application/pdf');
    return this.prisma.$transaction(async (tx) => {
      const file = await tx.file.create({
        data: {
          schoolId: document.schoolId,
          purpose: PURPOSE[document.kind],
          storageKey,
          originalName: rendered.fileName,
          mime: 'application/pdf',
          size: rendered.buffer.length,
          sha256: createHash('sha256').update(rendered.buffer).digest('hex'),
          uploadedById: document.ownerUserId,
          scanStatus: 'CLEAN',
        },
      });
      await tx.generatedDocument.update({
        where: { id: document.id },
        data: {
          status: 'READY',
          fileId: file.id,
          generatedAt: now,
          error: null,
        },
      });
      return file.id;
    });
  }
}
