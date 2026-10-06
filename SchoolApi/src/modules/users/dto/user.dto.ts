import type { UserStatus } from '../../../generated/prisma/client';
import { AssignmentDto } from './assignment.dto';

export class UserSummaryDto {
  id!: string;
  name!: string;
  email!: string | null;
  phone!: string | null;
  status!: UserStatus;
  roles!: string[];
  branchNames!: string[];
  lastLoginAt!: string | null;
  /** Set while sign-in is locked after failed attempts (POST /users/:id/unlock). */
  lockedUntil!: string | null;
}

export class UserDetailDto extends UserSummaryDto {
  assignments!: AssignmentDto[];
  mustChangePassword!: boolean;
  createdAt!: string;
}

export class CreatedUserDto extends UserDetailDto {
  /** Only when the server generated the password. Shown once. */
  temporaryPassword?: string;
}

export class TemporaryPasswordDto {
  temporaryPassword!: string;
}
