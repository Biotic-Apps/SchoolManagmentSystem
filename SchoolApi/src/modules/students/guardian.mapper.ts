import type { Guardian } from '../../generated/prisma/client';
import { maskId } from '../../core/common/masking';
import type { GuardianDto, GuardianLinkDto } from './dto/student.dto';
import type { GuardianLinkRow } from './students.repository';

export function toGuardianDto(row: Guardian, sensitive: boolean): GuardianDto {
  return {
    id: row.id,
    name: row.name,
    relation: row.relation,
    cnic: sensitive ? row.cnic : maskId(row.cnic),
    phone: row.phone,
    email: row.email,
    occupation: row.occupation,
    address: row.address,
    userId: row.userId,
    hasAccount: row.userId !== null,
  };
}

export function toGuardianLinkDto(
  row: GuardianLinkRow,
  sensitive: boolean,
): GuardianLinkDto {
  return {
    id: row.id,
    guardian: toGuardianDto(row.guardian, sensitive),
    relation: row.relation,
    isPrimary: row.isPrimary,
    status: row.status,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
  };
}
