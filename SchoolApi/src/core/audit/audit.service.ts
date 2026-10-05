import { Injectable } from '@nestjs/common';
import {
  requestContext,
  type RequestContext,
} from '../common/context/request-context';
import { toJson } from '../common/prisma-json';
import { PrismaService } from '../prisma/prisma.service';
import type { AuditEntry } from './audit-entry';

/**
 * Services stage entries during a request; AuditInterceptor writes them once
 * the handler succeeded. Outside a request (jobs) entries are written at once.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  stage(entry: AuditEntry): void {
    const context = requestContext.getStore();
    if (context) {
      context.auditEntries.push(entry);
      return;
    }
    void this.write([entry], {});
  }

  async flush(context: RequestContext): Promise<void> {
    const entries = context.auditEntries.splice(0);
    if (entries.length > 0) await this.write(entries, context);
  }

  async write(
    entries: AuditEntry[],
    context: Partial<RequestContext>,
  ): Promise<void> {
    await this.prisma.auditLog.createMany({
      data: entries.map((entry) => ({
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        schoolId: entry.schoolId ?? null,
        branchId: entry.branchId ?? null,
        actorId: entry.actorId ?? context.actorId ?? null,
        onBehalfOfStaffId: entry.onBehalfOfStaffId ?? null,
        before: entry.before === undefined ? undefined : toJson(entry.before),
        after: entry.after === undefined ? undefined : toJson(entry.after),
        ip: context.ip ?? null,
        userAgent: context.userAgent ?? null,
      })),
    });
  }
}
