import { Module } from '@nestjs/common';
import { ChallanBatchProcessor } from './challans/challan-batch.processor';
import { ChallanBatchService } from './challans/challan-batch.service';
import { ChallanPrintController } from './challans/challan-print.controller';
import { ChallanSource } from './challans/challan-source.service';
import { ConcessionApprovalHandler } from './concessions/concession-approval.handler';
import { ConcessionReader } from './concessions/concession-reader.service';
import { ConcessionsController } from './concessions/concessions.controller';
import { ConcessionsService } from './concessions/concessions.service';
import { DueRemindersProcessor } from './dues/due-reminders.processor';
import { DueRemindersService } from './dues/due-reminders.service';
import { DuesDetails } from './dues/dues-details.service';
import { DuesController } from './dues/dues.controller';
import { DuesService } from './dues/dues.service';
import { ActivityFeesService } from './generation/activity-fees.service';
import { GenerateInvoicesProcessor } from './generation/generate-invoices.processor';
import { GenerationContextService } from './generation/generation-context.service';
import { InvoiceGenerationService } from './generation/invoice-generation.service';
import { InvoiceGeneratorService } from './generation/invoice-generator.service';
import { ChallanRenderer } from './invoices/challan.renderer';
import { InvoiceActionsService } from './invoices/invoice-actions.service';
import { InvoiceCancelApprovalHandler } from './invoices/invoice-cancel-approval.handler';
import { InvoiceIssueService } from './invoices/invoice-issue.service';
import { InvoicePdfService } from './invoices/invoice-pdf.service';
import { InvoiceReader } from './invoices/invoice-reader.service';
import { InvoicesController } from './invoices/invoices.controller';
import { MarkOverdueProcessor } from './overdue/mark-overdue.processor';
import { FeeAccessService } from './shared/fee-access.service';
import { FeeStructureController } from './structure/fee-structure.controller';
import { FeeHeadsService } from './structure/fee-heads.service';
import { FeePlanReader } from './structure/fee-plan-reader.service';
import { FeePlanArchiveService } from './structure/fee-plan-archive.service';
import { FeePlansService } from './structure/fee-plans.service';
import { FeeSummaryService } from './student-fees/fee-summary.service';
import { StudentFeesController } from './student-fees/student-fees.controller';
import { StudentLedgerService } from './student-fees/student-ledger.service';

/** Phase 4 §B1/B2/B4/B5: fee structure, invoices, concessions, ledger views, dues. */
@Module({
  controllers: [
    FeeStructureController,
    InvoicesController,
    ChallanPrintController,
    ConcessionsController,
    StudentFeesController,
    DuesController,
  ],
  providers: [
    FeeAccessService,
    FeeHeadsService,
    FeePlanReader,
    FeePlansService,
    FeePlanArchiveService,
    GenerationContextService,
    ActivityFeesService,
    InvoiceGeneratorService,
    InvoiceGenerationService,
    GenerateInvoicesProcessor,
    InvoiceReader,
    InvoiceIssueService,
    InvoiceActionsService,
    InvoiceCancelApprovalHandler,
    InvoicePdfService,
    ChallanRenderer,
    ChallanSource,
    ChallanBatchService,
    ChallanBatchProcessor,
    MarkOverdueProcessor,
    ConcessionReader,
    ConcessionsService,
    ConcessionApprovalHandler,
    StudentLedgerService,
    FeeSummaryService,
    DuesDetails,
    DuesService,
    DueRemindersService,
    DueRemindersProcessor,
  ],
  exports: [InvoiceReader, FeeAccessService],
})
export class FeesModule {}
