import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
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
  PayrollOvertimeSource,
  PayrollOvertimeStatus,
} from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';
import { IsDateOnly } from '../../../../core/common/validation/is-date-only';
import { PERIOD_PATTERN } from '../../structures/dto/salary-structure.dto';

export class OvertimeQueryDto {
  @ApiProperty()
  @IsUUID()
  branchId!: string;

  @ApiProperty({ example: '2026-10' })
  @Matches(PERIOD_PATTERN, { message: 'month must be YYYY-MM' })
  month!: string;

  @ApiPropertyOptional({ enum: PayrollOvertimeStatus })
  @IsOptional()
  @IsIn(Object.values(PayrollOvertimeStatus))
  status?: PayrollOvertimeStatus;
}

export class OvertimeMonthDto {
  @ApiProperty()
  @IsUUID()
  branchId!: string;

  @ApiProperty({ example: '2026-10' })
  @Matches(PERIOD_PATTERN, { message: 'month must be YYYY-MM' })
  month!: string;
}

export class CreateOvertimeDto {
  @ApiProperty()
  @IsUUID()
  staffId!: string;

  @IsDateOnly()
  date!: string;

  @ApiProperty({ example: 120, description: 'Extra minutes worked' })
  @IsInt()
  @Min(1)
  @Max(16 * 60)
  minutes!: number;

  @ApiProperty({ example: 'Stayed for the annual function' })
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  reason!: string;
}

export class DecideOvertimeDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsUUID('all', { each: true })
  ids!: string[];

  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'])
  decision!: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class OvertimeDto {
  id!: string;
  staff!: IdNameDto;
  designation!: string;
  month!: string;
  @ApiProperty({ format: 'date' })
  date!: string;
  minutes!: number;
  @ApiProperty({ enum: PayrollOvertimeSource })
  source!: PayrollOvertimeSource;
  @ApiProperty({ enum: PayrollOvertimeStatus })
  status!: PayrollOvertimeStatus;
  reason!: string | null;
  checkOut!: string | null;
  decidedBy!: IdNameDto | null;
  decidedAt!: string | null;
  decisionNote!: string | null;
}

export class OvertimeListDto {
  @ApiProperty({ type: [OvertimeDto] })
  items!: OvertimeDto[];
  pendingCount!: number;
  approvedMinutes!: number;
  @ApiProperty({ description: 'Branch staff leave time used for detection' })
  staffLeavesAt!: string | null;
  overtimeEnabled!: boolean;
  @ApiProperty({ description: 'True when the month is approved (read-only)' })
  locked!: boolean;
}

export class OvertimeSyncResultDto {
  created!: number;
  updated!: number;
  removed!: number;
}
