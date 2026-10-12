import { createHash } from 'node:crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { StorageDriver } from '../../../../core/files/storage/storage-driver';
import type { JobProcessor } from '../../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../../core/jobs/queues';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import {
  AsyncTaskService,
  type TaskJobData,
} from '../../../tasks/async-task.service';
import { StaffIdCardContentLoader } from '../staff-id-card-content.loader';
import type { StaffIdCardContent } from '../staff-id-card-pdf';
import {
  STAFF_ID_CARD_SHEET_JOB,
  type StaffIdCardSheetInput,
} from './staff-id-card-bulk-job';
import { renderStaffIdCardSheet } from './staff-id-card-sheet';

/** Renders A4 sheets of staff ID cards and stores them as the job's file. */
@Injectable()
export class StaffIdCardSheetProcessor
  implements JobProcessor<TaskJobData<StaffIdCardSheetInput>>, OnModuleInit
{
  readonly queue = QUEUES.DOCUMENTS;
  readonly name = STAFF_ID_CARD_SHEET_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
    private readonly tasks: AsyncTaskService,
    private readonly content: StaffIdCardContentLoader,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  process(input: TaskJobData<StaffIdCardSheetInput>): Promise<void> {
    return this.tasks.track(input.taskId, async (progress) => {
      const total = input.staffIds.length;
      const cards: StaffIdCardContent[] = [];
      for (const [i, staffId] of input.staffIds.entries()) {
        cards.push(await this.content.load(staffId, null));
        if (i % 10 === 9) await progress((60 * (i + 1)) / total);
      }
      const pdf = await renderStaffIdCardSheet(cards, async (done) => {
        if (done % 10 === 0) await progress(60 + (35 * done) / total);
      });
      const fileId = await this.save(input, pdf);
      return { fileId, count: total };
    });
  }

  private async save(
    input: TaskJobData<StaffIdCardSheetInput>,
    pdf: Buffer,
  ): Promise<string> {
    const storageKey = `staff-id-cards/sheets/${new Date().getUTCFullYear()}/${input.taskId}.pdf`;
    await this.storage.put(storageKey, pdf, 'application/pdf');
    const file = await this.prisma.file.create({
      data: {
        schoolId: input.schoolId,
        purpose: 'ID_CARD',
        storageKey,
        originalName: `${input.baseName}.pdf`,
        mime: 'application/pdf',
        size: pdf.length,
        sha256: createHash('sha256').update(pdf).digest('hex'),
        uploadedById: input.requestedById,
        scanStatus: 'CLEAN',
      },
    });
    return file.id;
  }
}
