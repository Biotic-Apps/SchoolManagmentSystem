import type { BranchDto, BranchTimingsDto } from './dto/branch.dto';
import type { BranchRow } from './branches.repository';
import { withStaffDefaults } from './timings/branch-timings';

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
    timings: row.timings
      ? withStaffDefaults(row.timings as unknown as BranchTimingsDto)
      : null,
    workingDays: row.workingDays,
    principal: row.principal,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}
