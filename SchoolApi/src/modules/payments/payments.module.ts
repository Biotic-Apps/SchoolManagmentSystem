import { Module } from '@nestjs/common';
import { CollectionsController } from './collections/collections.controller';
import { CollectionsService } from './collections/collections.service';
import { FinanceDashboardController } from './dashboard/finance-dashboard.controller';
import { FinanceDashboardService } from './dashboard/finance-dashboard.service';
import { ManualGateway } from './gateways/manual.gateway';
import { OnlinePaymentsController } from './gateways/online-payments.controller';
import { OnlinePaymentsService } from './gateways/online-payments.service';
import { PaymentGatewayRegistry } from './gateways/payment-gateway.registry';
import { PaymentFollowup } from './payments/payment-followup';
import { PaymentQueryService } from './payments/payment-query.service';
import { PaymentReader } from './payments/payment-reader';
import { PaymentRecorder } from './payments/payment-recorder';
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService } from './payments/payments.service';
import { ProofReader } from './proofs/proof-reader';
import { ProofReviewService } from './proofs/proof-review.service';
import { ProofSubmitService } from './proofs/proof-submit.service';
import { ProofVerifier } from './proofs/proof-verifier';
import { ProofsController } from './proofs/proofs.controller';
import { ReceiptRenderer } from './receipts/receipt.renderer';
import { ReceiptSource } from './receipts/receipt-source';
import { ReceiptsService } from './receipts/receipts.service';
import { ThermalReceiptRenderer } from './receipts/thermal-receipt.renderer';
import { RefundApprovalHandler } from './refunds/refund-approval.handler';
import { RefundsController } from './refunds/refunds.controller';
import { RefundsService } from './refunds/refunds.service';
import { PaymentReversalHandler } from './reversal/payment-reversal.handler';
import { PaymentReversalService } from './reversal/payment-reversal.service';
import { FinanceAccess } from './shared/finance-access';

/** Phase 4 §B3–B5 + §G finance dashboard: money in, corrections, day closing. */
@Module({
  controllers: [
    // Online routes first so `payments/online/*` never reaches `payments/:id`.
    OnlinePaymentsController,
    PaymentsController,
    ProofsController,
    RefundsController,
    CollectionsController,
    FinanceDashboardController,
  ],
  providers: [
    FinanceAccess,
    PaymentRecorder,
    PaymentReader,
    PaymentFollowup,
    PaymentsService,
    PaymentQueryService,
    ReceiptsService,
    ReceiptSource,
    ReceiptRenderer,
    ThermalReceiptRenderer,
    PaymentReversalService,
    PaymentReversalHandler,
    RefundsService,
    RefundApprovalHandler,
    ProofReader,
    ProofSubmitService,
    ProofVerifier,
    ProofReviewService,
    ManualGateway,
    PaymentGatewayRegistry,
    OnlinePaymentsService,
    CollectionsService,
    FinanceDashboardService,
  ],
  exports: [PaymentRecorder, PaymentGatewayRegistry],
})
export class PaymentsModule {}
