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
import { IdCardContentLoader } from '../id-card-content.loader';
import type { IdCardContent } from '../id-card-pdf';
import { ID_CARD_SHEET_JOB, type IdCardSheetInput } from './id-card-bulk-job';
import { renderIdCardSheet } from './id-card-sheet';

/** Renders A4 sheets of ID cards and stores them as the job's file. */
@Injectable()
export class IdCardSheetProcessor
  implements JobProcessor<TaskJobData<IdCardSheetInput>>, OnModuleInit
{
  readonly queue = QUEUES.DOCUMENTS;
  readonly name = ID_CARD_SHEET_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
    private readonly tasks: AsyncTaskService,
    private readonly content: IdCardContentLoader,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  process(input: TaskJobData<IdCardSheetInput>): Promise<void> {
    return this.tasks.track(input.taskId, async (progress) => {
      const total = input.studentIds.length;
      const cards: IdCardContent[] = [];
      for (const [i, studentId] of input.studentIds.entries()) {
        cards.push(await this.content.load(studentId, null));
        if (i % 10 === 9) await progress((60 * (i + 1)) / total);
      }
      const pdf = await renderIdCardSheet(cards, async (done) => {
        if (done % 10 === 0) await progress(60 + (35 * done) / total);
      });
      const fileId = await this.save(input, pdf);
      return { fileId, count: total };
    });
  }

  private async save(
    input: TaskJobData<IdCardSheetInput>,
    pdf: Buffer,
  ): Promise<string> {
    const storageKey = `id-cards/sheets/${new Date().getUTCFullYear()}/${input.taskId}.pdf`;
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
