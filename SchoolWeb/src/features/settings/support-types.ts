export type NotificationChannel = "EMAIL" | "SMS" | "PUSH";

export type FailedRecipient = string | { name?: string | null; contact?: string | null };

export interface FailedNotification {
  id: string;
  recipient: FailedRecipient | null;
  channel: NotificationChannel | string;
  category: string;
  attempts: number;
  lastError: string | null;
  at: string;
}

export type JobRunStatus = "QUEUED" | "RUNNING" | "DONE" | "FAILED";

export interface JobRun {
  id: string;
  queue: string;
  name: string;
  status: JobRunStatus | string;
  attempts?: number | null;
  error?: string | null;
  startedAt?: string | null;
  createdAt?: string | null;
  finishedAt?: string | null;
}

export type LastBackupInfo = string | { finishedAt?: string | null; startedAt?: string | null } | null;

export interface SystemHealth {
  db: string;
  queue: { driver: string; waiting: number; failed: number };
  storage: { driver: string; ok: boolean };
  lastBackup: LastBackupInfo;
  lastRestoreVerified: string | null;
  version: string;
}

export type FailedNotificationFilters = { channel?: string; from?: string; to?: string };

export type SupportJobFilters = { queue?: string; status?: string; from?: string };
