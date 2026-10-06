import type {
  EnrollmentStatus,
  Gender,
  GuardianLinkStatus,
  GuardianRelation,
  StudentStatus,
} from '../../../generated/prisma/client';
import { DocumentDto } from '../../documents/dto/document.dto';

export class NamePhoneDto {
  name!: string;
  phone!: string;
}

export class StudentSummaryDto {
  id!: string;
  admissionNo!: string;
  name!: string;
  photoUrl!: string | null;
  gender!: Gender;
  dob!: string;
  className!: string | null;
  sectionName!: string | null;
  sectionId!: string | null;
  branchName!: string | null;
  rollNo!: number | null;
  status!: StudentStatus;
  primaryGuardian!: NamePhoneDto | null;
}

export class EnrollmentDto {
  id!: string;
  branchId!: string;
  branchName!: string;
  sessionId!: string;
  sessionName!: string;
  sectionId!: string;
  className!: string;
  sectionName!: string;
  rollNo!: number | null;
  startDate!: string;
  endDate!: string | null;
  status!: EnrollmentStatus;
  reason!: string | null;
}

export class GuardianDto {
  id!: string;
  name!: string;
  relation!: GuardianRelation;
  /** Masked unless `people.sensitive.view`. */
  cnic!: string | null;
  phone!: string;
  email!: string | null;
  occupation!: string | null;
  address!: string | null;
  userId!: string | null;
  hasAccount!: boolean;
}

export class GuardianLinkDto {
  id!: string;
  guardian!: GuardianDto;
  relation!: GuardianRelation;
  isPrimary!: boolean;
  status!: GuardianLinkStatus;
  verifiedAt!: string | null;
}

export class MedicalDto {
  allergies!: string | null;
  conditions!: string | null;
  notes!: string | null;
}

export class StudentDetailDto extends StudentSummaryDto {
  firstName!: string;
  lastName!: string;
  /** Masked unless `people.sensitive.view`. */
  bForm!: string | null;
  address!: string | null;
  admissionDate!: string;
  enrollment!: EnrollmentDto | null;
  guardians!: GuardianLinkDto[];
  documents!: DocumentDto[];
  /** Only with `health.view`. */
  medical!: MedicalDto | null;
}

export class RegisteredStudentDto {
  studentId!: string;
  admissionNo!: string;
}
