import type { TransferStatus } from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';

export class TransferStudentDto {
  id!: string;
  name!: string;
  admissionNo!: string;
}

export class TransferDto {
  id!: string;
  student!: TransferStudentDto;
  fromBranch!: IdNameDto;
  toBranch!: IdNameDto;
  effectiveDate!: string;
  reason!: string;
  status!: TransferStatus;
  decisionReason!: string | null;
  createdAt!: string;
}
