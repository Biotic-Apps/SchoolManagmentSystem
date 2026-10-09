import { createHash } from 'node:crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ID_CARD_JOB, type IdCardJobInput } from './id-card-job';
import { IdCardContentLoader } from './id-card-content.loader';
import { renderIdCard } from './id-card-pdf';

/** Renders the ID card PDF into file storage and marks the card READY. */
@Injectable()
export class IdCardProcessor
  implements JobProcessor<IdCardJobInput>, OnModuleInit
{
  readonly queue = QUEUES.DOCUMENTS;
  readonly name = ID_CARD_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
    private readonly content: IdCardContentLoader,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(input: IdCardJobInput): Promise<void> {
    try {
      await this.render(input.idCardId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.prisma.idCard.update({
        where: { id: input.idCardId },
        data: { status: 'FAILED', error: message.slice(0, 500) },
      });
      throw error;
    }
  }

  private async render(idCardId: string): Promise<void> {
    const card = await this.prisma.idCard.findUniqueOrThrow({
      where: { id: idCardId },
      include: { student: { select: { admissionNo: true } } },
    });
    const student = card.student;
    const pdf = await renderIdCard(
      await this.content.load(card.studentId, card.version),
    );

    const now = new Date();
    const storageKey = `id-cards/${now.getUTCFullYear()}/${card.id}.pdf`;
    await this.storage.put(storageKey, pdf, 'application/pdf');
    await this.prisma.$transaction(async (tx) => {
      const file = await tx.file.create({
        data: {
          schoolId: card.schoolId,
          purpose: 'ID_CARD',
          storageKey,
          originalName: `id-card-${student.admissionNo}-v${card.version}.pdf`,
          mime: 'application/pdf',
          size: pdf.length,
          sha256: createHash('sha256').update(pdf).digest('hex'),
          uploadedById: card.requestedById,
          scanStatus: 'CLEAN',
        },
      });
      await tx.idCard.update({
        where: { id: card.id },
        data: {
          status: 'READY',
          fileId: file.id,
          generatedAt: now,
          error: null,
        },
      });
    });
  }
}
