import { Global, Module } from '@nestjs/common';
import { ApprovalRouting } from './approval-routing';
import { InvoiceLedgerService } from './invoice-ledger.service';
import { InvoiceSettlementService } from './invoice-settlement.service';
import { LedgerService } from './ledger.service';

/** Money primitives shared by fees, payments, sales and payroll (Phase 4). */
@Global()
@Module({
  providers: [
    LedgerService,
    InvoiceSettlementService,
    InvoiceLedgerService,
    ApprovalRouting,
  ],
  exports: [
    LedgerService,
    InvoiceSettlementService,
    InvoiceLedgerService,
    ApprovalRouting,
  ],
})
export class FinanceCoreModule {}
