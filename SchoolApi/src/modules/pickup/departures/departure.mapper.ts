import type { Departure } from '../../../generated/prisma/client';
import type { DepartureDto } from '../dto/pickup.dto';

export type DepartureRow = Departure & {
  student: { id: string; firstName: string; lastName: string };
};

export const DEPARTURE_INCLUDE = {
  student: { select: { id: true, firstName: true, lastName: true } },
} as const;

export function toDepartureDto(
  row: DepartureRow,
  names: Map<string, string>,
): DepartureDto {
  return {
    id: row.id,
    student: {
      id: row.student.id,
      name: `${row.student.firstName} ${row.student.lastName}`,
    },
    earlyLeaveId: row.earlyLeaveId,
    pickedUpBy: {
      pickupPersonId: row.pickupPersonId,
      guardianId: row.guardianId,
      name: row.pickedUpByName,
    },
    at: row.at.toISOString(),
    recordedBy: {
      id: row.recordedById,
      name: names.get(row.recordedById) ?? '',
    },
  };
}
