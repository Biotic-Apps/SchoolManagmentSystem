import { Injectable } from '@nestjs/common';
import type { PageResult } from '../common/pagination/page-result';
import { toPageResult } from '../common/pagination/paginate';
import type { Scope } from '../rbac/scope/scope';
import { AuditRepository } from './audit.repository';
import type { AuditLogDto } from './dto/audit-log.dto';
import type { AuditQueryDto } from './dto/audit-query.dto';

@Injectable()
export class AuditQueryService {
  constructor(private readonly repository: AuditRepository) {}

  async list(
    scope: Scope,
    query: AuditQueryDto,
  ): Promise<PageResult<AuditLogDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    const actorIds = [
      ...new Set(rows.map((r) => r.actorId).filter((id) => id !== null)),
    ];
    const names = await this.repository.userNames(actorIds);
    const items = rows.map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      actor: row.actorId
        ? { id: row.actorId, name: names.get(row.actorId) ?? '' }
        : null,
      onBehalfOf: row.onBehalfOfStaffId,
      before: row.before,
      after: row.after,
      at: row.at.toISOString(),
    }));
    return toPageResult(items, total, query);
  }
}
