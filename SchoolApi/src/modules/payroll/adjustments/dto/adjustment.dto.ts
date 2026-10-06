import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  PayrollAdjustmentKind,
  PayrollAdjustmentStatus,
} from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';
import { PaginationQueryDto } from '../../../../core/common/pagination/pagination-query.dto';
import { PERIOD_PATTERN } from '../../structures/dto/salary-structure.dto';

export class AdjustmentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @ApiPropertyOptional({ example: '2026-09' })
  @IsOptional()
  @Matches(PERIOD_PATTERN, { message: 'month must be YYYY-MM' })
  month?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class CreateAdjustmentDto {
  @ApiProperty()
  @IsUUID()
  staffId!: string;

  @ApiProperty({ example: '2026-09' })
  @Matches(PERIOD_PATTERN, { message: 'month must be YYYY-MM' })
  month!: string;

  @ApiProperty({ enum: PayrollAdjustmentKind })
  @IsIn(Object.values(PayrollAdjustmentKind))
  kind!: PayrollAdjustmentKind;

  @ApiProperty({
    example: 100000,
    description: 'Positive; the kind sets the sign',
  })
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  amountMinor!: number;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class AdjustmentDto {
  id!: string;
  staffId!: string;
  staff!: IdNameDto;
  branchId!: string;
  month!: string;
  @ApiProperty({ enum: PayrollAdjustmentKind })
  kind!: PayrollAdjustmentKind;
  amountMinor!: number;
  @ApiProperty({ description: 'Effect on net pay (+ for BONUS/ARREAR)' })
  signedMinor!: number;
  reason!: string;
  @ApiProperty({ enum: PayrollAdjustmentStatus })
  status!: PayrollAdjustmentStatus;
  runId!: string | null;
  createdAt!: string;
  cancelledAt!: string | null;
  cancelReason!: string | null;
  @ApiProperty({ type: IdNameDto, nullable: true })
  cancelledBy!: IdNameDto | null;
}

export class CancelAdjustmentDto {
  @ApiProperty({ minLength: 3, maxLength: 500 })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
