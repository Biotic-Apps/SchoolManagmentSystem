import { Module } from '@nestjs/common';
import { ExamRefsService } from './exams/exam-refs.service';
import { ExamScheduleService } from './exams/exam-schedule.service';
import { ExamMapper } from './exams/exam.mapper';
import { ExamsController } from './exams/exams.controller';
import { ExamsService } from './exams/exams.service';
import { MarkSheetBuilder } from './exams/mark-sheet-builder';
import { GradingSchemesController } from './grading/grading-schemes.controller';
import { GradingSchemesService } from './grading/grading-schemes.service';
import { MarkEntryService } from './mark-sheets/mark-entry.service';
import { MarkReviewService } from './mark-sheets/mark-review.service';
import { MarkSheetAccessService } from './mark-sheets/mark-sheet-access.service';
import { MarkSheetNotifier } from './mark-sheets/mark-sheet-notifier';
import { MarkSheetMapper } from './mark-sheets/mark-sheet.mapper';
import { MarkSheetsController } from './mark-sheets/mark-sheets.controller';
import { MarkSheetsService } from './mark-sheets/mark-sheets.service';
import { MarkSubmitAction } from './mark-sheets/mark-submit.action';
import { HomeworkService } from './progress/homework.service';
import { ProgressNoteAction } from './progress/progress-note.action';
import { ProgressNotesService } from './progress/progress-notes.service';
import { ProgressController } from './progress/progress.controller';
import { PromotionSuggestProcessor } from './promotions/jobs/promotion-suggest.processor';
import { PromotionApplyService } from './promotions/promotion-apply.service';
import { PromotionApprovalHandler } from './promotions/promotion-approval.handler';
import { PromotionBuilder } from './promotions/promotion-builder';
import { PromotionConfirmService } from './promotions/promotion-confirm.service';
import { PromotionScope } from './promotions/promotion-scope';
import { PromotionMapper } from './promotions/promotion.mapper';
import { PromotionsController } from './promotions/promotions.controller';
import { PromotionsService } from './promotions/promotions.service';
import { AwardListComposer } from './printing/composers/award-list.composer';
import { DateSheetComposer } from './printing/composers/date-sheet.composer';
import { ReportCardsComposer } from './printing/composers/report-cards.composer';
import { ExamPrintContext } from './printing/exam-print-context';
import { ExamPrintController } from './printing/exam-print.controller';
import { ExamPrintProcessor } from './printing/exam-print.processor';
import { ExamPrintService } from './printing/exam-print.service';
import { PrintFileWriter } from './printing/print-file.writer';
import { ReportCardLoader } from './report-cards/report-card.loader';
import { ReportCardRenderer } from './report-cards/report-card.renderer';
import { ReportCardsService } from './report-cards/report-cards.service';
import { ExamReadinessService } from './results/exam-readiness.service';
import { ComputeResultsProcessor } from './results/jobs/compute-results.processor';
import { ResultApprovalService } from './results/result-approval.service';
import { ResultComputeService } from './results/result-compute.service';
import { ResultPublishHandler } from './results/result-publish.handler';
import { ResultPublishService } from './results/result-publish.service';
import { ResultWriter } from './results/result-writer';
import { ResultsController } from './results/results.controller';
import { ResultsQueryService } from './results/results-query.service';
import { StandingsReader } from './results/standings.reader';
import { ExamAccessService } from './shared/exam-access.service';
import { LookupService } from './shared/lookup.service';
import { RosterService } from './shared/roster.service';
import { StudentAccessService } from './shared/student-access.service';
import { SkillCardReader } from './skills/skill-card.reader';
import { SkillConfigService } from './skills/skill-config.service';
import { SkillRatingsService } from './skills/skill-ratings.service';
import { SkillSectionAccess } from './skills/skill-section-access';
import { SkillsController } from './skills/skills.controller';

/** Phase 4 §A: grading, exams, marks, results, report cards, progress, promotion. */
@Module({
  controllers: [
    GradingSchemesController,
    ExamsController,
    MarkSheetsController,
    ResultsController,
    ProgressController,
    PromotionsController,
    SkillsController,
    ExamPrintController,
  ],
  providers: [
    LookupService,
    RosterService,
    ExamAccessService,
    StudentAccessService,
    GradingSchemesService,
    ExamRefsService,
    ExamMapper,
    ExamsService,
    MarkSheetBuilder,
    ExamScheduleService,
    MarkSheetMapper,
    MarkSheetAccessService,
    MarkSheetsService,
    MarkEntryService,
    MarkSubmitAction,
    MarkSheetNotifier,
    MarkReviewService,
    ExamReadinessService,
    ResultWriter,
    ComputeResultsProcessor,
    ResultComputeService,
    ResultApprovalService,
    ResultPublishHandler,
    ResultPublishService,
    ResultsQueryService,
    ReportCardsService,
    ReportCardRenderer,
    ProgressNoteAction,
    ProgressNotesService,
    HomeworkService,
    PromotionScope,
    PromotionMapper,
    PromotionBuilder,
    PromotionSuggestProcessor,
    PromotionsService,
    PromotionConfirmService,
    PromotionApprovalHandler,
    PromotionApplyService,
    StandingsReader,
    SkillConfigService,
    SkillSectionAccess,
    SkillRatingsService,
    SkillCardReader,
    ReportCardLoader,
    ExamPrintContext,
    PrintFileWriter,
    ReportCardsComposer,
    DateSheetComposer,
    AwardListComposer,
    ExamPrintService,
    ExamPrintProcessor,
  ],
})
export class ResultsModule {}
