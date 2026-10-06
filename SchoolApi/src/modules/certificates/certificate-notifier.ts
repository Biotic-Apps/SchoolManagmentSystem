import { Injectable } from '@nestjs/common';
import { NotificationService } from '../../core/notifications/notification.service';
import { SchoolPeopleService } from '../school-day/school-people.service';
import { fullName } from '../students/student.mapper';
import type { CertificateRow } from './certificate.mapper';

const LABEL: Record<CertificateRow['type'], string> = {
  SCHOOL_LEAVING: 'School leaving',
  TRANSFER: 'Transfer',
  CHARACTER: 'Character',
  ATTENDANCE: 'Attendance',
  ACHIEVEMENT: 'Achievement',
};

/** CERTIFICATE notifications: principal on request, requester on decisions. */
@Injectable()
export class CertificateNotifier {
  constructor(
    private readonly notifications: NotificationService,
    private readonly people: SchoolPeopleService,
  ) {}

  async requested(row: CertificateRow, actorId: string): Promise<void> {
    const principal = await this.people.principalOf(row.branchId);
    if (!principal || principal === actorId) return;
    await this.send([principal], row, 'requested');
  }

  async decided(
    row: CertificateRow,
    actorId: string,
    outcome: 'approved' | 'rejected' | 'issued',
  ): Promise<void> {
    if (row.requestedById === actorId) return;
    await this.send([row.requestedById], row, outcome);
  }

  private send(userIds: string[], row: CertificateRow, verb: string) {
    return this.notifications.notify({
      userIds,
      category: 'CERTIFICATE',
      title: `${LABEL[row.type]} certificate ${verb}`,
      body: `${LABEL[row.type]} certificate for ${fullName(row.student)} was ${verb}.`,
      data: { certificateId: row.id, studentId: row.studentId },
    });
  }
}
