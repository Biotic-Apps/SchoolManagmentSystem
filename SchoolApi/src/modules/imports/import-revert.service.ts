import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { conflict } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AccessCache } from '../../core/rbac/access/access-cache';
import type { Scope } from '../../core/rbac/scope/scope';
import type { ImportDetailDto } from './dto/import.dto';
import { ImportAccessService } from './import-access.service';
import { COMMIT_TX } from './import-commit.service';
import { toDetail } from './import.mapper';
import { ImportKinds } from './kinds/import-kinds';
import { inUseError } from './kinds/shared/references';
import { targetOf } from './pipeline/import-target';

/**
 * Undoes a COMMITTED import while nothing references its records (409 with
 * `details.references` otherwise). Ledger rows are never deleted: opening
 * balances are cancelled with CANCELLATION entries instead.
 */
@Injectable()
export class ImportRevertService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ImportAccessService,
    private readonly kinds: ImportKinds,
    private readonly accessCache: AccessCache,
    private readonly audit: AuditService,
  ) {}

  async revert(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<ImportDetailDto> {
    const batch = await this.access.batch(scope, id);
    if (batch.status !== 'COMMITTED') {
      throw conflict(
        `Only committed imports can be reverted (${batch.status})`,
      );
    }
    const handler = this.kinds.get(batch.kind);
    const result = await this.prisma
      .$transaction(async (tx) => {
        const claimed = await tx.importBatch.updateMany({
          where: { id, status: 'COMMITTED' },
          data: {
            status: 'REVERTED',
            revertedById: user.id,
            revertedAt: new Date(),
          },
        });
        if (claimed.count === 0)
          throw conflict('Import is no longer committed');
        const target = await targetOf(tx, batch, user.id);
        const created = (batch.created ?? {}) as Record<string, unknown>;
        return handler.committer.revert(tx, target, created);
      }, COMMIT_TX)
      .catch((error: unknown) => {
        throw inUseError(error);
      });
    await Promise.all(
      (result.userIds ?? []).map((u) => this.accessCache.invalidateUser(u)),
    );
    this.audit.stage({
      action: 'import.revert',
      entityType: 'ImportBatch',
      entityId: id,
      schoolId: batch.schoolId,
      branchId: batch.branchId,
      before: { status: 'COMMITTED', created: batch.created },
      after: { status: 'REVERTED' },
    });
    return toDetail(await this.access.batch(scope, id));
  }
}
