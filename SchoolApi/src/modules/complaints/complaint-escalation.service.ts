import { Injectable } from '@nestjs/common';
import type { Complaint } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { conflict } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StudentPlacementService } from '../school-day/student-placement.service';
import { ComplaintNotifier } from './complaint-notifier';
import { ComplaintRouterService } from './complaint-router.service';
import { escalationChain, pickAssignee } from './complaint-routing';
import { isOpen, MAX_ESCALATION_LEVEL } from './complaint-status';

/** Moves an open complaint one level up (principal, then super admin). */
@Injectable()
export class ComplaintEscalationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly router: ComplaintRouterService,
    private readonly notifier: ComplaintNotifier,
    private readonly audit: AuditService,
    private readonly placements: StudentPlacementService,
  ) {}

  /** `actorId` null = the SLA job. */
  async escalate(
    complaint: Complaint,
    actorId: string | null,
    reason?: string,
  ): Promise<void> {
    if (!isOpen(complaint.status)) {
      throw conflict('Only open complaints can be escalated');
    }
    if (complaint.escalationLevel >= MAX_ESCALATION_LEVEL) {
      throw conflict('Complaint is already at the highest escalation level');
    }
    const level = complaint.escalationLevel + 1;
    const placement = complaint.studentId
      ? await this.placements.find(complaint.studentId)
      : null;
    const candidates = await this.router.candidates(
      complaint.branchId,
      placement?.sectionId ?? null,
    );
    const target =
      pickAssignee(escalationChain(level, candidates), complaint) ??
      complaint.assigneeId;
    const slaDueAt = await this.router.slaDueAt(
      complaint.branchId,
      complaint.category,
    );
    const updated = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.complaint.updateMany({
        where: { id: complaint.id, escalationLevel: complaint.escalationLevel },
        data: {
          escalationLevel: level,
          status: 'ESCALATED',
          assigneeId: target,
          slaDueAt,
        },
      });
      if (claimed.count === 0) throw conflict('Complaint changed meanwhile');
      await tx.complaintUpdate.create({
        data: {
          complaintId: complaint.id,
          authorId: actorId,
          message:
            reason ??
            (actorId
              ? `Escalated to level ${level}`
              : `Escalated to level ${level} after the SLA passed`),
          status: 'ESCALATED',
        },
      });
      return tx.complaint.findUniqueOrThrow({ where: { id: complaint.id } });
    });
    this.audit.stage({
      action: 'complaints.escalate',
      entityType: 'Complaint',
      entityId: complaint.id,
      schoolId: complaint.schoolId,
      branchId: complaint.branchId,
      actorId: actorId ?? undefined,
      before: {
        status: complaint.status,
        escalationLevel: complaint.escalationLevel,
        assigneeId: complaint.assigneeId,
      },
      after: {
        status: 'ESCALATED',
        escalationLevel: level,
        assigneeId: target,
      },
    });
    await this.notifier.statusChanged(updated, 'ESCALATED', actorId);
    if (target !== complaint.assigneeId) {
      await this.notifier.assigned(updated, target, actorId);
    }
  }
}
