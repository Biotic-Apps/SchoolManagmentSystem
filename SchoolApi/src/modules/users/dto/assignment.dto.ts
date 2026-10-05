import type { ScopeType } from '../../../generated/prisma/client';

export class AssignmentDto {
  id!: string;
  role!: string;
  roleName!: string;
  scopeType!: ScopeType;
  schoolId!: string | null;
  schoolName!: string | null;
  branchId!: string | null;
  branchName!: string | null;
  validUntil!: string | null;
}
