import type { PickupPerson } from '../../../generated/prisma/client';
import { maskId } from '../../../core/common/masking';
import type { UrlSigner } from '../../../core/files/url-signer';
import type { PickupPersonDto } from '../dto/pickup.dto';

/** `3520212345671` → `35202-1234567-1` so masking keeps the familiar shape. */
export function normaliseCnic(value?: string): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function toPickupPersonDto(
  row: PickupPerson,
  signer: UrlSigner,
  sensitive: boolean,
): PickupPersonDto {
  return {
    id: row.id,
    studentId: row.studentId,
    name: row.name,
    relation: row.relation,
    cnic: sensitive ? row.cnic : maskId(row.cnic),
    phone: row.phone,
    photoUrl: row.photoFileId ? signer.sign(row.photoFileId).url : null,
    status: row.status,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
  };
}
