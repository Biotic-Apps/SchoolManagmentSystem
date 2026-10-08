import type {
  StaffAssignmentKind,
  StaffStatus,
} from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';
import { DocumentDto } from '../../documents/dto/document.dto';

export class StaffAssignmentDto {
  id!: string;
  kind!: StaffAssignmentKind;
  sessionId!: string;
  sectionId!: string | null;
  sectionName!: string | null;
  className!: string | null;
  subjectId!: string | null;
  subjectName!: string | null;
  responsibleStaff!: IdNameDto | null;
  validUntil!: string | null;
  isSubstitute!: boolean;
}

export class StaffSummaryDto {
  id!: string;
  userId!: string | null;
  name!: string;
  photoUrl!: string | null;
  employeeNo!: string | null;
  designation!: string;
  branchId!: string;
  branchName!: string;
  status!: StaffStatus;
  roles!: string[];
  requiresReview!: boolean;
  /** `id` is the reviewer's user id. */
  reviewer!: IdNameDto | null;
  sectionCount!: number;
  subjectCount!: number;
}

export class StaffLoginDto {
  email!: string | null;
  phone!: string | null;
}

export class StaffDetailDto extends StaffSummaryDto {
  /** The sign-in identifiers; null when the staff member has no login. */
  login!: StaffLoginDto | null;
  email!: string | null;
  phone!: string | null;
  /** Masked unless `people.sensitive.view`. */
  cnic!: string | null;
  qualification!: string | null;
  joinDate!: string;
  assignments!: StaffAssignmentDto[];
  documents!: DocumentDto[];
}

export class CreatedStaffDto {
  staff!: StaffDetailDto;
  temporaryPassword?: string;
}

export class WorkloadDto {
  periodsPerWeek!: number;
  sections!: number;
  subjects!: number;
}

export class SectionStaffRefDto {
  id!: string;
  name!: string;
  userId!: string | null;
}

export class SubjectTeacherDto {
  staff!: SectionStaffRefDto;
  subject!: IdNameDto;
  isSubstitute!: boolean;
}

export class HelperDto {
  staff!: SectionStaffRefDto;
  responsibleStaff!: IdNameDto | null;
}

export class SectionStaffDto {
  classTeacher!: SectionStaffRefDto | null;
  subjectTeachers!: SubjectTeacherDto[];
  helpers!: HelperDto[];
}
