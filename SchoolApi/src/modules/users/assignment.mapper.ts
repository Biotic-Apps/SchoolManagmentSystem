import type { ActiveAssignment } from '../../core/rbac/access/active-assignment';
import type { AssignmentDto } from './dto/assignment.dto';

export function toAssignmentDto(a: ActiveAssignment): AssignmentDto {
  return {
    id: a.id,
    role: a.roleKey,
    roleName: a.roleName,
    scopeType: a.scopeType,
    schoolId: a.schoolId,
    schoolName: a.schoolName,
    branchId: a.branchId,
    branchName: a.branchName,
    validUntil: a.validUntil,
  };
}
