import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  FeeFrequency,
  FeePlanStatus,
} from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';

export class FeePlanItemInputDto {
  @IsUUID()
  feeHeadId!: string;

  /** Minor units (paisa), whole number ≥ 0. */
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  amountMinor!: number;

  @IsIn(Object.values(FeeFrequency))
  frequency!: FeeFrequency;

  /** Day of the month (clamped to short months). */
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay!: number;
}

export class LateFeeInputDto {
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  amountMinor!: number;

  /** Grace days after the due date. */
  @IsInt()
  @Min(0)
  @Max(365)
  afterDays!: number;
}

export class CreateFeePlanDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  sessionId!: string;

  @IsUUID()
  classId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => FeePlanItemInputDto)
  items!: FeePlanItemInputDto[];

  @ValidateIf((_, value) => value !== null)
  @ValidateNested()
  @Type(() => LateFeeInputDto)
  lateFee!: LateFeeInputDto | null;
}

export class UpdateFeePlanDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => FeePlanItemInputDto)
  items?: FeePlanItemInputDto[];

  /** `null` removes the late fee; omitted keeps it. */
  @IsOptional()
  @ValidateNested()
  @Type(() => LateFeeInputDto)
  lateFee?: LateFeeInputDto | null;
}

export class FeePlanQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsIn(Object.values(FeePlanStatus))
  status?: FeePlanStatus;
}

export class FeePlanItemDto {
  id!: string;
  feeHead!: IdNameDto;
  amountMinor!: number;
  frequency!: FeeFrequency;
  dueDay!: number;
}

export class LateFeeDto {
  amountMinor!: number;
  afterDays!: number;
}

export class FeePlanApprovedDto {
  /** Revision the generator bills from. */
  revision!: number;
  approvedAt!: string | null;
  approvedBy!: IdNameDto | null;
}

export class FeePlanDto {
  id!: string;
  branchId!: string;
  sessionId!: string;
  classId!: string;
  className!: string;
  name!: string;
  status!: FeePlanStatus;
  revision!: number;
  items!: FeePlanItemDto[];
  lateFee!: LateFeeDto | null;
  /** Last approved version (kept while an edit is a DRAFT). */
  approved!: FeePlanApprovedDto | null;
  createdById!: string;
  updatedById!: string | null;
  createdAt!: string;
  updatedAt!: string;
}
