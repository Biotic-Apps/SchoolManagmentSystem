import { Injectable } from '@nestjs/common';
import type { EarlyLeave } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type { EarlyLeaveDto } from '../dto/pickup.dto';

export type EarlyLeaveRow = EarlyLeave & {
  student: { id: string; firstName: string; lastName: string };
};

export const EARLY_LEAVE_INCLUDE = {
  student: { select: { id: true, firstName: true, lastName: true } },
} as const;

/** Early-leave rows → DTOs with requester/decider/pickup-person names. */
@Injectable()
export class EarlyLeaveMapper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly people: SchoolPeopleService,
  ) {}

  async toDtos(rows: EarlyLeaveRow[]): Promise<EarlyLeaveDto[]> {
    const userIds = rows.flatMap((r) =>
      r.decidedById ? [r.requestedById, r.decidedById] : [r.requestedById],
    );
    const personIds = rows
      .map((r) => r.pickupPersonId)
      .filter((id): id is string => !!id);
    const [names, persons] = await Promise.all([
      this.people.names(userIds),
      personIds.length > 0
        ? this.prisma.pickupPerson.findMany({
            where: { id: { in: personIds } },
            select: { id: true, name: true },
          })
        : [],
    ]);
    const personNames = new Map(persons.map((p) => [p.id, p.name]));
    const ref = (id: string) => ({ id, name: names.get(id) ?? '' });
    return rows.map((row) => ({
      id: row.id,
      student: {
        id: row.student.id,
        name: `${row.student.firstName} ${row.student.lastName}`,
      },
      sectionId: row.sectionId,
      date: formatDate(row.date),
      time: row.time,
      reason: row.reason,
      pickupPerson: row.pickupPersonId
        ? {
            id: row.pickupPersonId,
            name: personNames.get(row.pickupPersonId) ?? '',
          }
        : null,
      status: row.status,
      requestedBy: ref(row.requestedById),
      decidedBy: row.decidedById ? ref(row.decidedById) : null,
      comment: row.comment,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async toDto(row: EarlyLeaveRow): Promise<EarlyLeaveDto> {
    const [dto] = await this.toDtos([row]);
    return dto;
  }
}
