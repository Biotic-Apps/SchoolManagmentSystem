import type {
  ActivityStatus,
  ActivityType,
  ConsentStatus,
} from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';

export class ActivityAudienceDto {
  sectionIds!: string[];
  classIds!: string[];
  wholeBranch!: boolean;
}

export class ActivityDto {
  id!: string;
  branchId!: string;
  type!: ActivityType;
  title!: string;
  description!: string;
  startAt!: string;
  endAt!: string;
  venue!: string | null;
  audience!: ActivityAudienceDto;
  consentRequired!: boolean;
  consentDeadline!: string | null;
  feeMinor!: number | null;
  maxParticipants!: number | null;
  status!: ActivityStatus;
  reason!: string | null;
  proposedBy!: IdNameDto;
  approvalId!: string | null;
  createdAt!: string;
  /** Parents: the consent of the child the list was asked for. */
  myConsent?: ConsentStatus | null;
}

export class MyActivitiesDto {
  upcoming!: ActivityDto[];
  consentPending!: ActivityDto[];
}
