import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  StaffAssignmentKind,
  StaffStatus,
} from '../../../generated/prisma/client';
import { ListQueryDto } from '../../../core/common/pagination/list-query.dto';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../core/common/validation/is-date-only';
import { PHONE_PATTERN } from '../../me/dto/update-me.dto';
import { ID_NUMBER_PATTERN } from '../../students/dto/child-input.dto';

export const DESIGNATIONS = [
  'TEACHER',
  'HELPER',
  'COORDINATOR',
  'HEAD_TEACHER',
  'ACCOUNTANT',
  'OFFICE_STAFF',
  'OTHER',
] as const;
export type Designation = (typeof DESIGNATIONS)[number];

export const STAFF_ROLE_KEYS = [
  'TEACHER',
  'HELPER',
  'COORDINATOR',
  'HEAD_TEACHER',
  'ACCOUNTANT',
] as const;

export class StaffQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsIn(DESIGNATIONS)
  designation?: Designation;
}

export class UpdateStaffDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @Matches(PHONE_PATTERN, { message: 'phone must be a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  employeeNo?: string;

  // PRINCIPAL: a principal's payroll record (created from Salary & Payroll) stays editable.
  @IsOptional()
  @IsIn([...DESIGNATIONS, 'PRINCIPAL'])
  designation?: Designation | 'PRINCIPAL';

  @IsOptionalDateOnly()
  joinDate?: string;

  @IsOptional()
  @Matches(ID_NUMBER_PATTERN, { message: 'cnic must be 13 digits' })
  cnic?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  qualification?: string;

  @IsOptional()
  @IsUUID()
  photoFileId?: string;
}

export class CreateStaffDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @Matches(PHONE_PATTERN, { message: 'phone must be a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  employeeNo?: string;

  @IsIn(DESIGNATIONS)
  designation!: Designation;

  @IsDateOnly()
  joinDate!: string;

  @IsUUID()
  branchId!: string;

  @IsOptional()
  @Matches(ID_NUMBER_PATTERN, { message: 'cnic must be 13 digits' })
  cnic?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  qualification?: string;

  @IsOptional()
  @IsUUID()
  photoFileId?: string;

  @IsBoolean()
  createAccount!: boolean;

  /** Role of the new login; defaults from the designation. */
  @IsOptional()
  @IsIn(STAFF_ROLE_KEYS)
  roleKey?: (typeof STAFF_ROLE_KEYS)[number];
}

export class StaffStatusDto {
  @IsIn(Object.values(StaffStatus))
  status!: StaffStatus;

  @IsDateOnly()
  effectiveDate!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class ProbationDto {
  @IsBoolean()
  requiresReview!: boolean;

  /** Defaults to the branch principal. */
  @IsOptional()
  @IsUUID()
  reviewerUserId?: string;
}

export class AssignmentInput2Dto {
  @IsIn(Object.values(StaffAssignmentKind))
  kind!: StaffAssignmentKind;

  @IsUUID()
  sessionId!: string;

  @IsUUID()
  branchId!: string;

  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsUUID()
  responsibleStaffId?: string;

  /** ISO timestamp (substitutes). */
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsBoolean()
  isSubstitute?: boolean;
}

export class SessionQueryDto {
  @IsOptional()
  @IsUUID()
  sessionId?: string;
}
