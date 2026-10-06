import { Injectable } from '@nestjs/common';
import type { ComplaintStatus } from '../../generated/prisma/client';
import { NotificationService } from '../../core/notifications/notification.service';

interface NotifyRef {
  id: string;
  ticketNo: string;
  subject: string;
  complainantId: string;
}

const STATUS_TEXT: Record<ComplaintStatus, string> = {
  SUBMITTED: 'was submitted',
  ASSIGNED: 'was assigned',
  IN_PROGRESS: 'is in progress',
  RESOLVED: 'was resolved',
  CLOSED: 'was closed',
  ESCALATED: 'was escalated',
  REOPENED: 'was reopened',
};

/** Complaint notifications to the complainant, assignee and other party. */
@Injectable()
export class ComplaintNotifier {
  constructor(private readonly notifications: NotificationService) {}

  statusChanged(
    complaint: NotifyRef,
    status: ComplaintStatus,
    actorId: string | null,
  ): Promise<void> {
    return this.tell(
      complaint.complainantId,
      complaint,
      `Complaint ${complaint.ticketNo} ${STATUS_TEXT[status]}`,
      actorId,
      { status },
    );
  }

  assigned(
    complaint: NotifyRef,
    assigneeId: string | null,
    actorId: string | null,
  ): Promise<void> {
    return this.tell(
      assigneeId,
      complaint,
      `Complaint ${complaint.ticketNo} assigned to you`,
      actorId,
    );
  }

  tell(
    userId: string | null,
    complaint: NotifyRef,
    title: string,
    actorId: string | null,
    data: Record<string, unknown> = {},
  ): Promise<void> {
    if (!userId || userId === actorId) return Promise.resolve();
    return this.notifications.notify({
      userIds: [userId],
      category: 'COMPLAINT',
      title,
      body: complaint.subject,
      data: { complaintId: complaint.id, ...data },
    });
  }
}
