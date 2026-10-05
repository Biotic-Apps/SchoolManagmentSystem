import type {
  ApprovalDecision,
  ApprovalStatus,
  ApprovalType,
} from '../../../generated/prisma/client';
import { IdNameDto } from '../../common/dto/id-name.dto';

export class ApprovalStepDto {
  order!: number;
  approverRole!: string | null;
  approverUserId!: string | null;
  amountLimitMinor!: number | null;
  decision!: ApprovalDecision | null;
  comment!: string | null;
  decidedAt!: string | null;
  decidedBy!: IdNameDto | null;
}

export class ApprovalRequestDto {
  id!: string;
  type!: ApprovalType;
  entityType!: string;
  entityId!: string;
  branchId!: string | null;
  title!: string;
  amountMinor!: number | null;
  requestedBy!: IdNameDto;
  status!: ApprovalStatus;
  currentStep!: number;
  createdAt!: string;
  steps?: ApprovalStepDto[];
}
