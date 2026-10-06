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

export class StaffDetailDto extends StaffSummaryDto {
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

export class SubjectTeacherDto {
  staff!: IdNameDto;
  subject!: IdNameDto;
  isSubstitute!: boolean;
}

export class HelperDto {
  staff!: IdNameDto;
  responsibleStaff!: IdNameDto | null;
}

export class SectionStaffDto {
  classTeacher!: IdNameDto | null;
  subjectTeachers!: SubjectTeacherDto[];
  helpers!: HelperDto[];
}
