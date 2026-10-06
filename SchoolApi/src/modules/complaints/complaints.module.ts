import { Module } from '@nestjs/common';
import { ComplaintActionsService } from './complaint-actions.service';
import { ComplaintAttachments } from './complaint-attachments';
import { ComplaintEscalationService } from './complaint-escalation.service';
import { ComplaintNotifier } from './complaint-notifier';
import { ComplaintOriginService } from './complaint-origin.service';
import { ComplaintRouterService } from './complaint-router.service';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { SlaCheckProcessor } from './jobs/sla-check.processor';

/** Complaints of every role with routing, SLA and escalation (Phase 3 §8). */
@Module({
  controllers: [ComplaintsController],
  providers: [
    ComplaintsService,
    ComplaintActionsService,
    ComplaintAttachments,
    ComplaintEscalationService,
    ComplaintNotifier,
    ComplaintOriginService,
    ComplaintRouterService,
    SlaCheckProcessor,
  ],
})
export class ComplaintsModule {}
