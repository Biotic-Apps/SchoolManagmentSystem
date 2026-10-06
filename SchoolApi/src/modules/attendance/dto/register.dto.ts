import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';

export const REGISTER_VIEW_STATUSES = [
  'UNMARKED',
  'DRAFT',
  'SUBMITTED',
  'LOCKED',
  'PENDING_REVIEW',
] as const;
export type RegisterViewStatus = (typeof REGISTER_VIEW_STATUSES)[number];

export class RegisterEntryDto {
  entryId!: string | null;
  studentId!: string;
  name!: string;
  rollNo!: number | null;
  photoUrl!: string | null;
  @ApiProperty({ enum: AttendanceStatus, nullable: true })
  status!: AttendanceStatus | null;
  remark!: string | null;
  onLeave!: boolean;
}

export class RegisterDto {
  id!: string | null;
  sectionId!: string;
  date!: string;
  @ApiProperty({ enum: REGISTER_VIEW_STATUSES })
  status!: RegisterViewStatus;
  version!: number;
  submittedBy!: IdNameDto | null;
  onBehalfOf!: IdNameDto | null;
  lockedAt!: string | null;
  approvalId!: string | null;
  entries!: RegisterEntryDto[];
}

export class CorrectionDto {
  id!: string;
  entryId!: string;
  oldStatus!: AttendanceStatus;
  newStatus!: AttendanceStatus;
  reason!: string;
  status!: string;
  approvalId!: string | null;
  createdAt!: string;
}

export class AttendanceTallyDto {
  present!: number;
  absent!: number;
  late!: number;
  leave!: number;
  halfDay!: number;
  unmarked!: number;
  percent!: number | null;
}

export class StudentAttendanceEntryDto {
  date!: string;
  @ApiProperty({ enum: AttendanceStatus, nullable: true })
  status!: AttendanceStatus | null;
  remark!: string | null;
}

export class StudentAttendanceDto {
  entries!: StudentAttendanceEntryDto[];
  summary!: AttendanceTallyDto;
}

export class SectionAttendanceDto {
  sectionId!: string;
  className!: string;
  sectionName!: string;
  @ApiProperty({ enum: REGISTER_VIEW_STATUSES })
  status!: RegisterViewStatus;
  present!: number;
  absent!: number;
  late!: number;
  leave!: number;
  halfDay!: number;
  total!: number;
}

export class UnmarkedSectionDto {
  sectionId!: string;
  className!: string;
  sectionName!: string;
  @ApiProperty({ enum: REGISTER_VIEW_STATUSES })
  status!: RegisterViewStatus;
  classTeacher!: IdNameDto | null;
}
