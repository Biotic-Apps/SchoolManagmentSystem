import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  ChildLinkRequestStatus,
  GuardianRelation,
} from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';
import { IsDateOnly } from '../../../core/common/validation/is-date-only';

export class RequestChildLinkDto {
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  admissionNo!: string;

  @IsDateOnly()
  dob!: string;

  @IsIn(Object.values(GuardianRelation))
  relation!: GuardianRelation;
}

export class VerifyChildLinkOtpDto {
  @Matches(/^\d{6}$/, { message: 'code must be 6 digits' })
  code!: string;
}

export class ChildLinkQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(Object.values(ChildLinkRequestStatus))
  status?: ChildLinkRequestStatus;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class DecideChildLinkDto {
  /** Shown to the parent on rejection; same as comment. */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export class ChildLinkStartedDto {
  requestId!: string;
  maskedPhone!: string;
  /** Only when NODE_ENV=development. */
  devCode?: string;
}

export class ChildLinkGuardianDto {
  id!: string;
  name!: string;
  phone!: string;
}

export class ChildLinkStudentDto {
  id!: string;
  name!: string;
  admissionNo!: string;
  className!: string | null;
  sectionName!: string | null;
}

export class ChildLinkRequestDto {
  id!: string;
  guardian!: ChildLinkGuardianDto;
  student!: ChildLinkStudentDto;
  relation!: GuardianRelation;
  status!: ChildLinkRequestStatus;
  approvalId!: string | null;
  createdAt!: string;
}
