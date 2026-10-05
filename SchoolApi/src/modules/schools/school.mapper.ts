import type { SignedUrl } from '../../core/files/url-signer';
import type { SchoolDto } from './dto/school.dto';
import type { SchoolRow } from './schools.repository';

export function toSchoolDto(
  row: SchoolRow,
  sign: (fileId: string) => SignedUrl,
): SchoolDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    address: row.address,
    phone: row.phone,
    email: row.email,
    website: row.website,
    logoUrl: row.logoFileId ? sign(row.logoFileId).url : null,
    status: row.status,
    branchCount: row._count.branches,
    createdAt: row.createdAt.toISOString(),
  };
}
