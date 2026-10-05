import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { parseDate } from '../common/dates';
import { toSkipTake } from '../common/pagination/paginate';
import { PrismaService } from '../prisma/prisma.service';
import type { Scope } from '../rbac/scope/scope';
import type { AuditQueryDto } from './dto/audit-query.dto';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: AuditQueryDto) {
    const where: Prisma.AuditLogWhereInput = {
      AND: [
        scope.branchFilter(),
        {
          entityType: query.entityType,
          entityId: query.entityId,
          actorId: query.actorId,
          branchId: query.branchId,
          at: {
            gte: query.from ? parseDate(query.from) : undefined,
            lt: query.to
              ? new Date(parseDate(query.to).getTime() + 86_400_000)
              : undefined,
          },
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { at: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { rows, total };
  }

  async userNames(ids: string[]): Promise<Map<string, string>> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
    return new Map(users.map((user) => [user.id, user.name]));
  }
}
