import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { SchoolPeopleService } from '../school-day/school-people.service';

/** No "system" category exists; NOTICE is the closest general one. */
const ALERT_CATEGORY = 'NOTICE';

/**
 * Audit + Super Admin alerts for backup jobs. Jobs write audit rows at once
 * (inline jobs can run after the request already flushed its entries).
 */
@Injectable()
export class BackupAlerts {
  private readonly logger = new Logger(BackupAlerts.name);

  constructor(
    private readonly audit: AuditService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
  ) {}

  async record(
    action: string,
    backupId: string,
    after: Record<string, unknown>,
  ): Promise<void> {
    await this.audit
      .write(
        [{ action, entityType: 'BackupRun', entityId: backupId, after }],
        {},
      )
      .catch((error: unknown) =>
        this.logger.error(`Audit ${action} failed: ${String(error)}`),
      );
  }

  async failed(
    kind: 'backup' | 'verify',
    backupId: string,
    message: string,
  ): Promise<void> {
    const error = message.slice(0, 500);
    await this.record(`backup.${kind}Failed`, backupId, { error });
    try {
      const title =
        kind === 'backup'
          ? 'Database backup failed'
          : 'Backup restore check failed';
      await this.notifications.notify({
        userIds: await this.people.superAdmins(),
        category: ALERT_CATEGORY,
        title,
        body: `${error} Open Settings › Backups for details.`,
        data: { backupId, kind },
      });
    } catch (e) {
      this.logger.error(`Backup alert could not be sent: ${String(e)}`);
    }
  }
}
