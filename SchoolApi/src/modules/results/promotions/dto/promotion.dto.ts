import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  PromotionDecisionKind,
  PromotionStatus,
} from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';
import { IsDateOnly } from '../../../../core/common/validation/is-date-only';

export class SuggestPromotionsDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  fromSessionId!: string;

  @IsUUID()
  toSessionId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsUUID('all', { each: true })
  examIds!: string[];
}

export class PromotionQueryDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  fromSessionId!: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ enum: PromotionDecisionKind })
  @IsOptional()
  @IsIn(Object.values(PromotionDecisionKind))
  decision?: PromotionDecisionKind;
}

export class UpdatePromotionDto {
  @ApiProperty({ enum: PromotionDecisionKind })
  @IsIn(Object.values(PromotionDecisionKind))
  decision!: PromotionDecisionKind;

  @IsOptional()
  @IsUUID()
  toSectionId?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason?: string;
}

export class ConfirmPromotionsDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  fromSessionId!: string;

  @IsOptional()
  @IsUUID()
  classId?: string;
}

export class ApplyPromotionsDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  fromSessionId!: string;

  @IsDateOnly()
  effectiveDate!: string;
}

export class PromotionRowDto {
  id!: string;
  student!: IdNameDto;
  fromSessionId!: string;
  toSessionId!: string;
  fromClass!: IdNameDto;
  fromSection!: IdNameDto;
  toClass!: IdNameDto | null;
  toSection!: IdNameDto | null;
  @ApiProperty({ enum: PromotionDecisionKind })
  suggested!: PromotionDecisionKind;
  @ApiProperty({ enum: PromotionDecisionKind })
  decision!: PromotionDecisionKind;
  @ApiProperty({ enum: PromotionStatus })
  status!: PromotionStatus;
  percent!: number | null;
  failedSubjects!: number;
  @ApiProperty({ type: Object, nullable: true })
  basis!: unknown;
  reason!: string | null;
  overridden!: boolean;
  approvalId!: string | null;
  effectiveDate!: string | null;
  appliedAt!: string | null;
  newEnrollmentId!: string | null;
}

export class ConfirmPromotionsResultDto {
  approvalId!: string;
  count!: number;
}

export class SkippedPromotionDto {
  id!: string;
  studentId!: string;
  reason!: string;
}

export class ApplyPromotionsResultDto {
  applied!: number;
  @ApiProperty({ type: [SkippedPromotionDto] })
  skipped!: SkippedPromotionDto[];
}
