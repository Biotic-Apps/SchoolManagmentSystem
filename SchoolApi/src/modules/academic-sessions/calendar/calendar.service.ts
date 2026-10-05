import { Injectable } from '@nestjs/common';
import type { CalendarEvent } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import { invalid, notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { assertDateRange } from '../../../core/common/validation/date-range';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { CalendarEventDto } from '../dto/calendar-event.dto';
import type { CalendarQueryDto } from '../dto/calendar-query.dto';
import type { CreateCalendarEventDto } from '../dto/create-calendar-event.dto';
import type { UpdateCalendarEventDto } from '../dto/update-calendar-event.dto';
import { toCalendarEventDto } from './calendar.mapper';
import { CalendarRepository } from './calendar.repository';

@Injectable()
export class CalendarService {
  constructor(
    private readonly repository: CalendarRepository,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: CalendarQueryDto,
  ): Promise<CalendarEventDto[]> {
    const branch = query.branchId
      ? await this.repository.findBranch(query.branchId)
      : undefined;
    if (query.branchId && !branch) throw notFound('Branch');
    if (branch) scope.assertReadBranch(branch);
    const rows = await this.repository.list(scope, {
      branch: branch ?? undefined,
      from: query.from ? parseDate(query.from) : undefined,
      to: query.to ? parseDate(query.to) : undefined,
    });
    return rows.map(toCalendarEventDto);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateCalendarEventDto,
  ): Promise<CalendarEventDto> {
    await this.assertWritable(scope, dto.schoolId, dto.branchId ?? null);
    const startDate = parseDate(dto.startDate);
    const endDate = parseDate(dto.endDate);
    assertDateRange(startDate, endDate);
    const row = await this.repository.create({
      schoolId: dto.schoolId,
      branchId: dto.branchId ?? null,
      type: dto.type,
      title: dto.title.trim(),
      description: dto.description,
      startDate,
      endDate,
      createdById: user.id,
    });
    return this.audited('calendar.create', undefined, row);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateCalendarEventDto,
  ): Promise<CalendarEventDto> {
    const before = await this.find(scope, id);
    const startDate = dto.startDate
      ? parseDate(dto.startDate)
      : before.startDate;
    const endDate = dto.endDate ? parseDate(dto.endDate) : before.endDate;
    assertDateRange(startDate, endDate);
    const row = await this.repository.update(id, {
      type: dto.type,
      title: dto.title?.trim(),
      description: dto.description,
      startDate,
      endDate,
      updatedById: user.id,
    });
    return this.audited('calendar.update', before, row);
  }

  async remove(user: AuthUser, scope: Scope, id: string): Promise<void> {
    const before = await this.find(scope, id);
    const row = await this.repository.update(id, {
      status: 'ARCHIVED',
      updatedById: user.id,
    });
    this.audited('calendar.delete', before, row);
  }

  private async find(scope: Scope, id: string): Promise<CalendarEvent> {
    const row = await this.repository.findById(id);
    if (!row) throw notFound('Calendar event');
    await this.assertWritable(scope, row.schoolId, row.branchId);
    return row;
  }

  /** Whole-school events need school-level access; branch events branch access. */
  private async assertWritable(
    scope: Scope,
    schoolId: string,
    branchId: string | null,
  ): Promise<void> {
    if (!branchId) {
      scope.assertManageSchool(schoolId);
      return;
    }
    const branch = await this.repository.findBranch(branchId);
    if (!branch || branch.schoolId !== schoolId)
      throw invalid('Branch does not belong to the school');
    scope.assertManageBranch(branch);
  }

  private audited(
    action: string,
    before: CalendarEvent | undefined,
    after: CalendarEvent,
  ): CalendarEventDto {
    const dto = toCalendarEventDto(after);
    this.audit.stage({
      action,
      entityType: 'CalendarEvent',
      entityId: after.id,
      schoolId: after.schoolId,
      branchId: after.branchId,
      before: before && toCalendarEventDto(before),
      after: dto,
    });
    return dto;
  }
}
