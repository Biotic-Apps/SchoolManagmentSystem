import type { RecordStatus } from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';

export class BranchTimingsDto {
  /** HH:mm */
  opensAt!: string;
  closesAt!: string;
  attendanceLockAt!: string;
}

export class BranchDto {
  id!: string;
  schoolId!: string;
  schoolName!: string;
  code!: string;
  name!: string;
  address!: string | null;
  phone!: string | null;
  email!: string | null;
  timings!: BranchTimingsDto | null;
  /** 1 = Monday … 7 = Sunday */
  workingDays!: number[];
  principal!: IdNameDto | null;
  status!: RecordStatus;
  createdAt!: string;
}
