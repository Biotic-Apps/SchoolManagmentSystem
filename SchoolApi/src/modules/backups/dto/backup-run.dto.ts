import type {
  BackupRun,
  BackupRunStatus,
  BackupTrigger,
  BackupVerifyStatus,
} from '../../../generated/prisma/client';
import type { VerifyCheck } from '../verify/verify-checks';

export class BackupCheckDto {
  name!: string;
  expected!: string | number | null;
  actual!: string | number | null;
  ok!: boolean;
}

export class BackupVerifyDto {
  status!: BackupVerifyStatus;
  /** When the restore check passed (or, if it failed, when it started). */
  at!: string | null;
  checks!: BackupCheckDto[];
  error!: string | null;
}

export class BackupRunDto {
  id!: string;
  startedAt!: string;
  finishedAt!: string | null;
  status!: BackupRunStatus;
  sizeBytes!: number | null;
  checksumSha256!: string | null;
  encrypted!: boolean;
  storageKey!: string | null;
  /** "pg_dump", "copy", or "pending" before the job picked one. */
  format!: string;
  trigger!: BackupTrigger;
  error!: string | null;
  prunedAt!: string | null;
  verify!: BackupVerifyDto;
}

export class BackupJobDto {
  jobId!: string;
}

export class BackupDownloadDto {
  url!: string;
  expiresAt!: string;
}

const iso = (d: Date | null) => (d ? d.toISOString() : null);

export function toBackupRunDto(run: BackupRun): BackupRunDto {
  const at =
    run.verifiedAt ??
    (run.verifyStatus === 'FAILED' ? run.verifyStartedAt : null);
  return {
    id: run.id,
    startedAt: run.startedAt.toISOString(),
    finishedAt: iso(run.finishedAt),
    status: run.status,
    sizeBytes: run.sizeBytes === null ? null : Number(run.sizeBytes),
    checksumSha256: run.checksumSha256,
    encrypted: run.encrypted,
    storageKey: run.storageKey,
    format: run.format,
    trigger: run.trigger,
    error: run.error,
    prunedAt: iso(run.prunedAt),
    verify: {
      status: run.verifyStatus,
      at: iso(at),
      checks: (run.verifyChecks as VerifyCheck[] | null) ?? [],
      error: run.verifyError,
    },
  };
}
