export class RoleDto {
  id!: string;
  key!: string;
  name!: string;
  isSystem!: boolean;
  schoolId!: string | null;
  permissions!: string[];
  assignmentCount!: number;
}

export class PermissionDto {
  key!: string;
  module!: string;
  action!: string;
  description!: string;
}
