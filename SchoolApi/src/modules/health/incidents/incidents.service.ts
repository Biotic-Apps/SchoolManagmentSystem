import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  forbidden,
  forbiddenScope,
  notFound,
} from '../../../core/common/errors/errors';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import type { PageResult } from '../../../core/common/pagination/page-result';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { FileRefService } from '../../../core/files/file-ref.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { localDateTime } from '../../school-day/clock';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { StudentPlacementService } from '../../school-day/student-placement.service';
import type {
  CloseIncidentDto,
  CreateIncidentDto,
  IncidentDto,
  IncidentQueryDto,
} from '../dto/health-incident.dto';
import { studentScopeWhere } from './incident-scope';
import { INCIDENT_INCLUDE, IncidentMapper } from './incident.mapper';

const DAY_MS = 86_400_000;

/** Contract §10: incidents reported by staff; guardians alerted at once. */
@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placements: StudentPlacementService,
    private readonly people: SchoolPeopleService,
    private readonly files: FileRefService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
    private readonly mapper: IncidentMapper,
  ) {}

  async report(
    user: AuthUser,
    scope: Scope,
    dto: CreateIncidentDto,
  ): Promise<IncidentDto> {
    if (scope.guardian) throw forbidden('Only staff report incidents');
    const placement = await this.placements.read(scope, dto.studentId);
    const fileIds = [...new Set(dto.attachmentFileIds ?? [])];
    for (const fileId of fileIds) {
      await this.files.assertUsable(fileId, {
        schoolId: placement.schoolId,
        userId: user.id,
        purposes: ['ATTACHMENT', 'DOCUMENT'],
      });
    }
    const guardians = await this.people.guardianUserIds([dto.studentId]);
    const row = await this.prisma.healthIncident.create({
      data: {
        schoolId: placement.schoolId,
        branchId: placement.branchId,
        studentId: dto.studentId,
        occurredAt: new Date(dto.occurredAt),
        type: dto.type,
        severity: dto.severity,
        description: dto.description,
        actionTaken: dto.actionTaken,
        attachmentFileIds: fileIds,
        status: guardians.length > 0 ? 'PARENT_NOTIFIED' : 'REPORTED',
        reportedById: user.id,
      },
      include: INCIDENT_INCLUDE,
    });
    this.audit.stage({
      action: 'health.incident_report',
      entityType: 'HealthIncident',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: {
        studentId: row.studentId,
        type: row.type,
        severity: row.severity,
      },
    });
    const data = { incidentId: row.id, studentId: row.studentId };
    await this.notifications.notify({
      userIds: guardians,
      category: 'HEALTH',
      title: `Health incident: ${placement.name}`,
      body: `${row.type.replace('_', ' ').toLowerCase()} (${row.severity.toLowerCase()}): ${row.actionTaken}`,
      data,
    });
    if (row.severity === 'SERIOUS') {
      const principal = await this.people.principalOf(row.branchId);
      if (principal && principal !== user.id) {
        await this.notifications.notify({
          userIds: [principal],
          category: 'HEALTH',
          title: `Serious incident: ${placement.name}`,
          body: row.description,
          data,
        });
      }
    }
    return this.mapper.toDto(row);
  }

  async list(
    scope: Scope,
    query: IncidentQueryDto,
  ): Promise<PageResult<IncidentDto>> {
    if (
      scope.guardian &&
      query.studentId &&
      !scope.canAccessStudent(query.studentId)
    )
      throw notFound('Student');
    const where: Prisma.HealthIncidentWhereInput = {
      AND: [
        await studentScopeWhere(scope, this.people),
        query.studentId ? { studentId: query.studentId } : {},
        query.branchId ? { branchId: query.branchId } : {},
        query.from || query.to
          ? {
              occurredAt: {
                gte: query.from
                  ? localDateTime(query.from, '00:00')
                  : undefined,
                lt: query.to
                  ? new Date(
                      localDateTime(query.to, '00:00').getTime() + DAY_MS,
                    )
                  : undefined,
              },
            }
          : {},
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.healthIncident.findMany({
        where,
        include: INCIDENT_INCLUDE,
        orderBy: { occurredAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.healthIncident.count({ where }),
    ]);
    return toPageResult(await this.mapper.toDtos(rows), total, query);
  }

  async close(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: CloseIncidentDto,
  ): Promise<IncidentDto> {
    const incident = await this.prisma.healthIncident.findUnique({
      where: { id },
    });
    if (!incident) throw notFound('Incident');
    if (
      !scope.canManageBranch({
        id: incident.branchId,
        schoolId: incident.schoolId,
      })
    )
      throw forbiddenScope();
    if (incident.status === 'CLOSED')
      throw conflict('Incident is already closed');
    const row = await this.prisma.healthIncident.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedById: user.id,
        closedAt: new Date(),
        closeNote: dto.note ?? null,
      },
      include: INCIDENT_INCLUDE,
    });
    this.audit.stage({
      action: 'health.incident_close',
      entityType: 'HealthIncident',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: { status: incident.status },
      after: { status: row.status, note: row.closeNote },
    });
    return this.mapper.toDto(row);
  }
}
