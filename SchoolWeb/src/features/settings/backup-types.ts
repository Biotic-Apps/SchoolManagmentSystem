export type BackupStatus = "RUNNING" | "DONE" | "FAILED";
export type VerifyStatus = "NOT_RUN" | "RUNNING" | "PASSED" | "FAILED";

export interface BackupCheck {
  name: string;
  expected: string | number | null;
  actual: string | number | null;
  ok: boolean;
}

export interface BackupVerify {
  status: VerifyStatus;
  at: string | null;
  checks: BackupCheck[];
}

export interface BackupRun {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: BackupStatus;
  sizeBytes: number | null;
  checksumSha256: string | null;
  encrypted: boolean;
  storageKey: string | null;
  verify: BackupVerify | null;
}
