export const BACKUP_JOBS = {
  /** Manual backup of an existing RUNNING BackupRun ({ runId, taskId }). */
  BACKUP: 'maintenance.backup',
  /** Nightly 02:00: backup + retention. */
  NIGHTLY: 'maintenance.backupNightly',
  /** Restore check of a BackupRun whose verify is RUNNING ({ runId, taskId }). */
  VERIFY: 'maintenance.backupVerify',
  /** Sunday 03:30: restore check of the latest stored backup. */
  VERIFY_WEEKLY: 'maintenance.backupVerifyWeekly',
} as const;

export interface BackupJobData {
  runId: string;
  taskId?: string;
}
