import { Injectable } from '@nestjs/common';
import { notFound } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type { BatchRow } from './import.mapper';

/**
 * Imports belong to a branch: callers (settings.edit / settings.import) need
 * management scope over it; other branches' imports look missing (404).
 */
@Injectable()
export class ImportAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async batch(scope: Scope, id: string): Promise<BatchRow> {
    const batch = await this.prisma.importBatch.findUnique({ where: { id } });
    if (
      !batch ||
      !scope.canManageBranch({ id: batch.branchId, schoolId: batch.schoolId })
    ) {
      throw notFound('Import');
    }
    return this.withPeople([batch]).then((rows) => rows[0]);
  }

  /** Adds `createdBy { id, name }`. */
  async withPeople(batches: BatchRow[]): Promise<BatchRow[]> {
    const ids = [...new Set(batches.map((b) => b.createdById))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
    const byId = new Map(users.map((u) => [u.id, u]));
    return batches.map((b) => ({
      ...b,
      createdBy: byId.get(b.createdById) ?? null,
    }));
  }
}
