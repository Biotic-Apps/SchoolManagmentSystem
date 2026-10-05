import type { RecordStatus } from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';

export class SectionDto {
  id!: string;
  branchId!: string;
  sessionId!: string;
  classId!: string;
  className!: string;
  name!: string;
  capacity!: number | null;
  room!: IdNameDto | null;
  /** 0 until enrollments arrive in Phase 2. */
  studentCount!: number;
  status!: RecordStatus;
}
