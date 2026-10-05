export interface Permission {
  key: string;
  module: string;
  action: string;
  description: string;
}

export interface Role {
  id: string;
  key: string;
  name: string;
  isSystem: boolean;
  schoolId: string | null;
  permissions: string[];
  assignmentCount: number;
}

export interface RoleInput {
  name?: string;
  schoolId?: string;
  permissions?: string[];
}
