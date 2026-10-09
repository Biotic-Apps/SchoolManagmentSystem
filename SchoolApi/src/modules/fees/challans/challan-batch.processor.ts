import { createHash } from 'node:crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { fullName } from '../../students/student.mapper';
import {
  AsyncTaskService,
  type TaskJobData,
} from '../../tasks/async-task.service';
import {
  batchFileName,
  batchWhere,
  PRINT_CHALLANS_JOB,
  sortBatch,
  type PrintChallansInput,
} from './challan-batch';
import { ChallanPdf } from './challan-pdf';
import { ChallanSource } from './challan-source.service';

const CHUNK = 40;

/** Renders every challan of a branch / class / section and month into one PDF. */
@Injectable()
export class ChallanBatchProcessor
  implements JobProcessor<TaskJobData<PrintChallansInput>>, OnModuleInit
{
  readonly queue = QUEUES.DOCUMENTS;
  readonly name = PRINT_CHALLANS_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly tasks: AsyncTaskService,
    private readonly prisma: PrismaService,
    private readonly source: ChallanSource,
    private readonly storage: StorageDriver,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  process(input: TaskJobData<PrintChallansInput>): Promise<void> {
    return this.tasks.track(input.taskId, async (progress) => {
      const ids = await this.invoiceIds(input);
      if (ids.length === 0) throw new Error('No invoices to print');
      const school = await this.source.school(input.branchId);
      const pdf = new ChallanPdf();
      for (let i = 0; i < ids.length; i += CHUNK) {
        for (const view of await this.source.views(
          ids.slice(i, i + CHUNK),
          school,
        ))
          await pdf.add(view);
        await progress(((i + CHUNK) / ids.length) * 95);
      }
      const buffer = await pdf.toBuffer();
      const fileId = await this.store(input, buffer);
      return { fileId, count: pdf.pages };
    });
  }

  private async invoiceIds(input: PrintChallansInput): Promise<string[]> {
    const rows = await this.prisma.invoice.findMany({
      where: batchWhere(input),
      select: {
        id: true,
        sectionId: true,
        student: { select: { firstName: true, lastName: true } },
      },
    });
    const sections = await this.prisma.section.findMany({
      where: {
        id: { in: rows.flatMap((r) => (r.sectionId ? [r.sectionId] : [])) },
      },
      select: {
        id: true,
        name: true,
        schoolClass: { select: { levelOrder: true } },
      },
    });
    const byId = new Map(sections.map((s) => [s.id, s]));
    return sortBatch(
      rows.map((row) => {
        const section = row.sectionId ? byId.get(row.sectionId) : undefined;
        return {
          id: row.id,
          classOrder:
            section?.schoolClass.levelOrder ?? Number.MAX_SAFE_INTEGER,
          sectionName: section?.name ?? '',
          studentName: fullName(row.student),
        };
      }),
    );
  }

  private async label(input: PrintChallansInput): Promise<string | null> {
    if (input.sectionId) {
      const section = await this.prisma.section.findUnique({
        where: { id: input.sectionId },
        select: { name: true, schoolClass: { select: { name: true } } },
      });
      return section ? `${section.schoolClass.name} ${section.name}` : null;
    }
    if (input.classId) {
      const schoolClass = await this.prisma.schoolClass.findUnique({
        where: { id: input.classId },
        select: { name: true },
      });
      return schoolClass?.name ?? null;
    }
    return null;
  }

  private async store(
    input: TaskJobData<PrintChallansInput>,
    buffer: Buffer,
  ): Promise<string> {
    const branch = await this.prisma.branch.findUniqueOrThrow({
      where: { id: input.branchId },
      select: { code: true },
    });
    const storageKey = `generated/challan-batch/${new Date().getUTCFullYear()}/${input.taskId}.pdf`;
    await this.storage.put(storageKey, buffer, 'application/pdf');
    const file = await this.prisma.file.create({
      data: {
        schoolId: input.schoolId,
        purpose: 'CHALLAN',
        storageKey,
        originalName: batchFileName(
          branch.code,
          input.period,
          await this.label(input),
        ),
        mime: 'application/pdf',
        size: buffer.length,
        sha256: createHash('sha256').update(buffer).digest('hex'),
        uploadedById: input.requestedById,
        scanStatus: 'CLEAN',
      },
    });
    return file.id;
  }
}
