import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { AppError } from '../../../core/common/errors/app-error';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import { conflict, invalid } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { localDateTime, localTime } from '../../school-day/clock';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import {
  StudentPlacementService,
  type StudentPlacement,
} from '../../school-day/student-placement.service';
import type {
  CreateDepartureDto,
  DepartureDto,
  DepartureQueryDto,
  PickedUpByDto,
} from '../dto/pickup.dto';
import { DEPARTURE_INCLUDE, toDepartureDto } from './departure.mapper';
import { studentScopeWhere } from './departure-scope';
import { authorizePickup, type Picker } from './pickup-authorization';

const DAY_MS = 86_400_000;

interface ResolvedPicker {
  picker: Picker;
  name: string;
}

/** Contract §11: gate departures; unverified pickers are blocked and reported. */
@Injectable()
export class DeparturesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placements: StudentPlacementService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async record(
    user: AuthUser,
    scope: Scope,
    dto: CreateDepartureDto,
  ): Promise<DepartureDto> {
    const { pickupPersonId, guardianId } = dto.pickedUpBy;
    if (!pickupPersonId === !guardianId)
      throw invalid('Give exactly one of pickupPersonId or guardianId');
    const placement = await this.placements.read(scope, dto.studentId);
    const resolved = await this.resolvePicker(dto.pickedUpBy);
    const decision = authorizePickup(dto.studentId, resolved.picker);
    if (!decision.allowed) {
      await this.block(
        placement,
        dto.pickedUpBy,
        resolved.name,
        decision.reason,
      );
    }
    if (dto.earlyLeaveId) await this.assertApprovedLeave(dto);

    const at = dto.at ? new Date(dto.at) : new Date();
    const row = await this.prisma.$transaction(async (tx) => {
      if (dto.earlyLeaveId) {
        const moved = await tx.earlyLeave.updateMany({
          where: { id: dto.earlyLeaveId, status: 'APPROVED' },
          data: { status: 'DEPARTED' },
        });
        if (moved.count === 0) throw conflict('Early leave changed, reload');
      }
      return tx.departure.create({
        data: {
          schoolId: placement.schoolId,
          branchId: placement.branchId,
          studentId: dto.studentId,
          earlyLeaveId: dto.earlyLeaveId ?? null,
          pickupPersonId: pickupPersonId ?? null,
          guardianId: guardianId ?? null,
          pickedUpByName: resolved.name,
          at,
          recordedById: user.id,
        },
        include: DEPARTURE_INCLUDE,
      });
    });
    this.audit.stage({
      action: 'pickup.departure',
      entityType: 'Departure',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: {
        studentId: row.studentId,
        earlyLeaveId: row.earlyLeaveId,
        pickupPersonId: row.pickupPersonId,
        guardianId: row.guardianId,
      },
    });
    await this.notifications.notify({
      userIds: await this.people.guardianUserIds([row.studentId]),
      category: 'PICKUP',
      title: `${placement.name} has left school`,
      body: `Picked up by ${resolved.name} at ${localTime(at)}.`,
      data: { departureId: row.id, studentId: row.studentId },
    });
    const names = await this.people.names([user.id]);
    return toDepartureDto(row, names);
  }

  async list(scope: Scope, query: DepartureQueryDto): Promise<DepartureDto[]> {
    const start = query.date ? localDateTime(query.date, '00:00') : null;
    const where: Prisma.DepartureWhereInput = {
      AND: [
        await studentScopeWhere(scope, this.people),
        query.branchId ? { branchId: query.branchId } : {},
        start
          ? { at: { gte: start, lt: new Date(start.getTime() + DAY_MS) } }
          : {},
      ],
    };
    const rows = await this.prisma.departure.findMany({
      where,
      include: DEPARTURE_INCLUDE,
      orderBy: { at: 'desc' },
    });
    const names = await this.people.names(rows.map((r) => r.recordedById));
    return rows.map((row) => toDepartureDto(row, names));
  }

  private async resolvePicker(by: PickedUpByDto): Promise<ResolvedPicker> {
    if (by.pickupPersonId) {
      const person = await this.prisma.pickupPerson.findUnique({
        where: { id: by.pickupPersonId },
        select: { studentId: true, status: true, name: true },
      });
      return {
        picker: { kind: 'PERSON', person },
        name: person?.name ?? 'Unknown person',
      };
    }
    const guardian = await this.prisma.guardian.findUnique({
      where: { id: by.guardianId },
      select: {
        name: true,
        studentLinks: { select: { studentId: true, status: true } },
      },
    });
    return {
      picker: { kind: 'GUARDIAN', links: guardian?.studentLinks ?? [] },
      name: guardian?.name ?? 'Unknown guardian',
    };
  }

  /** Audited at once (the request fails) and the principal is alerted. */
  private async block(
    placement: StudentPlacement,
    by: PickedUpByDto,
    name: string,
    reason: string,
  ): Promise<never> {
    await this.audit.recordNow({
      action: 'pickup.blocked',
      entityType: 'Student',
      entityId: placement.studentId,
      schoolId: placement.schoolId,
      branchId: placement.branchId,
      after: { ...by, name, reason },
    });
    const principal = await this.people.principalOf(placement.branchId);
    await this.notifications.notify({
      userIds: principal ? [principal] : [],
      category: 'PICKUP',
      title: `Pickup blocked: ${placement.name}`,
      body: `${name} tried to collect ${placement.name}. ${reason}.`,
      data: { studentId: placement.studentId },
    });
    throw new AppError(
      ErrorCode.PICKUP_NOT_AUTHORIZED,
      'This person is not authorized to collect the student',
      { reason },
    );
  }

  private async assertApprovedLeave(dto: CreateDepartureDto): Promise<void> {
    const leave = await this.prisma.earlyLeave.findUnique({
      where: { id: dto.earlyLeaveId },
    });
    if (leave?.studentId !== dto.studentId)
      throw invalid('Early leave does not belong to this student');
    if (leave.status !== 'APPROVED')
      throw conflict(`Early leave is ${leave.status.toLowerCase()}`);
  }
}
