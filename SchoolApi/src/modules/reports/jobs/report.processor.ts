import { Injectable, OnModuleInit } from '@nestjs/common';
import { parseDate } from '../../../core/common/dates';
import { schoolDate } from '../../../core/common/school-time';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  AsyncTaskService,
  type TaskJobData,
} from '../../tasks/async-task.service';
import { REPORT_QUERIES } from '../queries';
import { renderReport } from '../render/render-report';
import { REPORT_JOB, type ReportJobInput } from '../report-job';
import { ReportFileWriter } from '../report-file.writer';

/** Runs a report query, renders CSV/XLSX/PDF and stores the file. */
@Injectable()
export class ReportProcessor
  implements JobProcessor<TaskJobData<ReportJobInput>>, OnModuleInit
{
  readonly queue = QUEUES.REPORTS;
  readonly name = REPORT_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly prisma: PrismaService,
    private readonly tasks: AsyncTaskService,
    private readonly files: ReportFileWriter,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  process(input: TaskJobData<ReportJobInput>): Promise<void> {
    return this.tasks.track(input.taskId, async (progress) => {
      const query = REPORT_QUERIES[input.key];
      if (!query) throw new Error(`Unknown report ${input.key}`);
      const today = schoolDate();
      const table = await query({
        prisma: this.prisma,
        params: input.params,
        today: parseDate(today),
      });
      await progress(60);
      const school = await this.prisma.school.findUnique({
        where: { id: input.schoolId },
        select: { name: true },
      });
      const rendered = await renderReport(table, input.format, {
        schoolName: school?.name ?? 'eSchool',
        generatedAt: today,
      });
      const fileId = await this.files.save({
        taskId: input.taskId,
        schoolId: input.schoolId,
        ownerId: input.requestedById,
        baseName: `${input.key.replace('.', '-')}-${today}`,
        report: rendered,
      });
      return { fileId, count: table.rows.length };
    });
  }
}
