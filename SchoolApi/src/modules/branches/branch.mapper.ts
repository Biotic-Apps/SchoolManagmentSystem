import type { BranchDto, BranchTimingsDto } from './dto/branch.dto';
import type { BranchRow } from './branches.repository';

export function toBranchDto(row: BranchRow): BranchDto {
  return {
    id: row.id,
    schoolId: row.schoolId,
    schoolName: row.school.name,
    code: row.code,
    name: row.name,
    address: row.address,
    phone: row.phone,
    email: row.email,
    timings: (row.timings as BranchTimingsDto | null) ?? null,
    workingDays: row.workingDays,
    principal: row.principal,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}
