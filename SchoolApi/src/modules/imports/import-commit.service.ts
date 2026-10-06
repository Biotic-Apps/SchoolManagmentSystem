import { Injectable, Logger } from '@nestjs/common';
import type { ImportBatch } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { AppError } from '../../core/common/errors/app-error';
import { conflict } from '../../core/common/errors/errors';
import { toJson } from '../../core/common/prisma-json';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AccessCache } from '../../core/rbac/access/access-cache';
import type { Scope } from '../../core/rbac/scope/scope';
import type { ImportDetailDto } from './dto/import.dto';
import { ImportAccessService } from './import-access.service';
import { toDetail } from './import.mapper';
import { ImportKinds } from './kinds/import-kinds';
import type { CommitResult, Db } from './kinds/kind-handler';
import { targetOf } from './pipeline/import-target';
import { MAX_STORED_ERRORS } from './pipeline/import-validation.service';
import { recheckRows, totalsOf, type StoredRow } from './pipeline/run-checks';
import type { RowError } from './validation/sheet';

/** Large imports (≤ 5000 rows) run in one transaction. */
export const COMMIT_TX = { timeout: 600_000, maxWait: 15_000 };

class StaleRows extends Error {
  constructor(readonly errors: RowError[]) {
    super('stale rows');
  }
}

/**
 * Applies the valid rows of an import in ONE transaction (all-or-nothing),
 * synchronously; the response is the committed import.
 */
@Injectable()
export class ImportCommitService {
  private readonly logger = new Logger(ImportCommitService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ImportAccessService,
    private readonly kinds: ImportKinds,
    private readonly accessCache: AccessCache,
    private readonly audit: AuditService,
  ) {}

  async commit(
    user: AuthUser,
    scope: Scope,
    id: string,
    skipInvalid: boolean,
  ): Promise<ImportDetailDto> {
    const batch = await this.access.batch(scope, id);
    const totals = batch.totals as { valid?: number; invalid?: number };
    const allowed =
      batch.status === 'READY' ||
      (batch.status === 'INVALID' && skipInvalid && (totals.valid ?? 0) > 0);
    if (!allowed) {
      throw conflict(
        batch.status === 'INVALID'
          ? 'The file has invalid rows: fix them or commit with skipInvalid'
          : `Import is ${batch.status}`,
        { status: batch.status },
      );
    }
    const claimed = await this.prisma.importBatch.updateMany({
      where: { id, status: batch.status },
      data: { status: 'COMMITTING', skipInvalid },
    });
    if (claimed.count === 0)
      throw conflict('Import is already being processed');

    let result: CommitResult;
    try {
      result = await this.prisma.$transaction(
        (tx) => this.apply(tx, batch, user.id),
        COMMIT_TX,
      );
    } catch (error) {
      throw await this.failed(batch, error);
    }
    await Promise.all(
      (result.userIds ?? []).map((u) => this.accessCache.invalidateUser(u)),
    );
    this.audit.stage({
      action: 'import.commit',
      entityType: 'ImportBatch',
      entityId: id,
      schoolId: batch.schoolId,
      branchId: batch.branchId,
      after: {
        kind: batch.kind,
        skipInvalid,
        reconciliation: result.reconciliation ?? null,
      },
    });
    return toDetail(await this.access.batch(scope, id));
  }

  private async apply(
    tx: Db,
    batch: ImportBatch,
    actorId: string,
  ): Promise<CommitResult> {
    const handler = this.kinds.get(batch.kind);
    const target = await targetOf(tx, batch, actorId);
    const stored = (batch.rows ?? []) as unknown as StoredRow[];
    const fresh = await recheckRows(handler, stored, tx, target);
    if (fresh.errors.length > 0) throw new StaleRows(fresh.errors);
    const result = await handler.committer.commit(
      tx,
      target,
      fresh.rows,
      fresh.ctx,
    );
    const skipped = stored.length - fresh.rows.length;
    await tx.importBatch.update({
      where: { id: batch.id },
      data: {
        status: 'COMMITTED',
        created: toJson(result.created),
        reconciliation: toJson({ ...result.reconciliation, skipped }),
        committedById: actorId,
        committedAt: new Date(),
        error: null,
      },
    });
    return result;
  }

  /** Records the outcome of a failed commit; returns the error to throw. */
  private async failed(batch: ImportBatch, error: unknown): Promise<AppError> {
    if (error instanceof StaleRows) {
      const stored = (batch.rows ?? []) as unknown as StoredRow[];
      const byRow = new Map<number, RowError[]>();
      for (const e of error.errors)
        byRow.set(e.row, [...(byRow.get(e.row) ?? []), e]);
      const rows = stored.map((r) => ({
        ...r,
        errors: [...r.errors, ...(byRow.get(r.row) ?? [])],
      }));
      const errors = rows.flatMap((r) => r.errors);
      await this.prisma.importBatch.update({
        where: { id: batch.id },
        data: {
          status: 'INVALID',
          rows: toJson(rows),
          totals: toJson(totalsOf(rows)),
          errors: toJson(errors.slice(0, MAX_STORED_ERRORS)),
        },
      });
      return conflict('Some rows are no longer valid; nothing was applied', {
        errors: error.errors.slice(0, 100),
      });
    }
    const message =
      error instanceof AppError
        ? error.message
        : 'Unexpected error while applying the import';
    if (!(error instanceof AppError)) {
      this.logger.error(`Import ${batch.id} commit failed`, error);
    }
    await this.prisma.importBatch.update({
      where: { id: batch.id },
      data: { status: 'FAILED', error: message.slice(0, 500) },
    });
    return conflict(`The import failed and nothing was applied: ${message}`);
  }
}
