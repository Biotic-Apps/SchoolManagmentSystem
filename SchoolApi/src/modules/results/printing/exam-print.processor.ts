import { Injectable, OnModuleInit } from '@nestjs/common';
import type { FilePurpose } from '../../../generated/prisma/client';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../core/jobs/queues';
import {
  AsyncTaskService,
  type TaskJobData,
} from '../../tasks/async-task.service';
import { AwardListComposer } from './composers/award-list.composer';
import { DateSheetComposer } from './composers/date-sheet.composer';
import { ReportCardsComposer } from './composers/report-cards.composer';
import { PrintFileWriter } from './print-file.writer';
import {
  EXAM_PRINT_JOB,
  type ComposedPdf,
  type ExamPrintInput,
  type ExamPrintKind,
  type Progress,
} from './print-job';

const PURPOSE: Record<ExamPrintKind, FilePurpose> = {
  REPORT_CARDS: 'REPORT_CARD',
  DATE_SHEET: 'REPORT',
  AWARD_LIST: 'REPORT',
};

/** Renders a bulk exam PDF on the documents queue and stores it. */
@Injectable()
export class ExamPrintProcessor
  implements JobProcessor<TaskJobData<ExamPrintInput>>, OnModuleInit
{
  readonly queue = QUEUES.DOCUMENTS;
  readonly name = EXAM_PRINT_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly tasks: AsyncTaskService,
    private readonly files: PrintFileWriter,
    private readonly cards: ReportCardsComposer,
    private readonly dateSheet: DateSheetComposer,
    private readonly awardList: AwardListComposer,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  process(input: TaskJobData<ExamPrintInput>): Promise<void> {
    return this.tasks.track(input.taskId, async (progress) => {
      const pdf = await this.compose(input, progress);
      await progress(95);
      const fileId = await this.files.save({
        taskId: input.taskId,
        schoolId: input.schoolId,
        ownerId: input.requestedById,
        purpose: PURPOSE[input.kind],
        fileName: `${pdf.baseName}.pdf`,
        buffer: pdf.buffer,
      });
      return { fileId, count: pdf.count };
    });
  }

  private compose(
    input: ExamPrintInput,
    progress: Progress,
  ): Promise<ComposedPdf> {
    switch (input.kind) {
      case 'REPORT_CARDS':
        return this.cards.compose(input, progress);
      case 'DATE_SHEET':
        return this.dateSheet.compose(input);
      case 'AWARD_LIST':
        return this.awardList.compose(input);
    }
  }
}
