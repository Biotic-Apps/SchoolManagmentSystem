import { createHash } from 'node:crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  STAFF_ID_CARD_JOB,
  type StaffIdCardJobInput,
} from './staff-id-card-job';
import { StaffIdCardContentLoader } from './staff-id-card-content.loader';
import { renderStaffIdCard } from './staff-id-card-pdf';

/** Renders the staff ID card PDF into file storage and marks the card READY. */
@Injectable()
export class StaffIdCardProcessor
  implements JobProcessor<StaffIdCardJobInput>, OnModuleInit
{
  readonly queue = QUEUES.DOCUMENTS;
  readonly name = STAFF_ID_CARD_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
    private readonly content: StaffIdCardContentLoader,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(input: StaffIdCardJobInput): Promise<void> {
    try {
      await this.render(input.idCardId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.prisma.staffIdCard.update({
        where: { id: input.idCardId },
        data: { status: 'FAILED', error: message.slice(0, 500) },
      });
      throw error;
    }
  }

  private async render(idCardId: string): Promise<void> {
    const card = await this.prisma.staffIdCard.findUniqueOrThrow({
      where: { id: idCardId },
      include: { staff: { select: { employeeNo: true } } },
    });
    const pdf = await renderStaffIdCard(
      await this.content.load(card.staffId, card.version),
    );

    const now = new Date();
    const storageKey = `staff-id-cards/${now.getUTCFullYear()}/${card.id}.pdf`;
    await this.storage.put(storageKey, pdf, 'application/pdf');
    await this.prisma.$transaction(async (tx) => {
      const file = await tx.file.create({
        data: {
          schoolId: card.schoolId,
          purpose: 'ID_CARD',
          storageKey,
          originalName: `staff-id-card-${card.staff.employeeNo ?? card.staffId}-v${card.version}.pdf`,
          mime: 'application/pdf',
          size: pdf.length,
          sha256: createHash('sha256').update(pdf).digest('hex'),
          uploadedById: card.requestedById,
          scanStatus: 'CLEAN',
        },
      });
      await tx.staffIdCard.update({
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
