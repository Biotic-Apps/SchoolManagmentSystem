import type { ImportBatch } from '../../generated/prisma/client';
import type {
  ImportDetailDto,
  ImportRowErrorDto,
  ImportSummaryDto,
  ImportTotalsDto,
} from './dto/import.dto';

export type BatchRow = ImportBatch & {
  createdBy?: { id: string; name: string } | null;
};

const iso = (value: Date | null) => (value ? value.toISOString() : null);

function totals(value: unknown): ImportTotalsDto {
  const t = (value ?? {}) as Partial<ImportTotalsDto>;
  return { rows: t.rows ?? 0, valid: t.valid ?? 0, invalid: t.invalid ?? 0 };
}

export function toSummary(batch: BatchRow): ImportSummaryDto {
  return {
    id: batch.id,
    kind: batch.kind,
    status: batch.status,
    branchId: batch.branchId,
    sessionId: batch.sessionId,
    fileName: batch.fileName,
    totals: totals(batch.totals),
    createdAt: batch.createdAt.toISOString(),
    startedAt: batch.createdAt.toISOString(),
    startedBy: batch.createdBy ?? null,
    committedAt: iso(batch.committedAt),
    revertedAt: iso(batch.revertedAt),
  };
}

/** Never includes `rows` or `created` (internal; no passwords are kept). */
export function toDetail(batch: BatchRow): ImportDetailDto {
  return {
    ...toSummary(batch),
    errors: (Array.isArray(batch.errors) ? batch.errors : []).slice(
      0,
      500,
    ) as unknown as ImportRowErrorDto[],
    preview: (Array.isArray(batch.preview) ? batch.preview : []) as Record<
      string,
      unknown
    >[],
    reconciliation: (batch.reconciliation ?? null) as Record<
      string,
      unknown
    > | null,
    error: batch.error,
  };
}
