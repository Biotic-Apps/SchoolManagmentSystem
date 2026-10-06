import { Injectable } from '@nestjs/common';
import { formatDate } from '../../core/common/dates';
import { NotificationService } from '../../core/notifications/notification.service';

export interface MeetingParties {
  id: string;
  date: Date;
  startTime: string;
  staffUserId: string;
  guardian: { userId: string | null };
}

/** MEETING notifications to the other party of a meeting. */
@Injectable()
export class MeetingNotifier {
  constructor(private readonly notifications: NotificationService) {}

  /** Notifies every participant except the actor. */
  others(
    meeting: MeetingParties,
    actorId: string | null,
    title: string,
    body?: string,
  ): Promise<void> {
    const userIds = [meeting.staffUserId, meeting.guardian.userId].filter(
      (id): id is string => !!id && id !== actorId,
    );
    return this.send(userIds, meeting, title, body);
  }

  send(
    userIds: string[],
    meeting: MeetingParties,
    title: string,
    body?: string,
  ): Promise<void> {
    return this.notifications.notify({
      userIds,
      category: 'MEETING',
      title,
      body: body ?? `${formatDate(meeting.date)} at ${meeting.startTime}`,
      data: { meetingId: meeting.id },
    });
  }
}
