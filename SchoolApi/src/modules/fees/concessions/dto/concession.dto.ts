import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  ConcessionType,
  FinanceRequestStatus,
} from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';
import { PaginationQueryDto } from '../../../../core/common/pagination/pagination-query.dto';

const PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/;

export class CreateConcessionDto {
  @IsUUID()
  studentId!: string;

  /** Omitted = the whole invoice. */
  @IsOptional()
  @IsUUID()
  feeHeadId?: string;

  @IsIn(Object.values(ConcessionType))
  type!: ConcessionType;

  /** PERCENT: whole percent 1–100; FIXED: minor units per invoice. */
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  value!: number;

  @Matches(PERIOD, { message: 'from must be YYYY-MM' })
  from!: string;

  @IsOptional()
  @Matches(PERIOD, { message: 'to must be YYYY-MM' })
  to?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class ConcessionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsIn(Object.values(FinanceRequestStatus))
  status?: FinanceRequestStatus;
}

export class ConcessionStudentDto {
  id!: string;
  name!: string;
  admissionNo!: string;
}

export class ConcessionDto {
  id!: string;
  branchId!: string;
  student!: ConcessionStudentDto;
  feeHead!: IdNameDto | null;
  type!: ConcessionType;
  value!: number;
  from!: string;
  to!: string | null;
  reason!: string;
  /** Concession on one month of the student's approved plan (approval amount). */
  estimateMinor!: number;
  status!: FinanceRequestStatus;
  approvalId!: string | null;
  requestedBy!: IdNameDto;
  decidedAt!: string | null;
  createdAt!: string;
}
