import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';

export const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export class PayComponentDto {
  @ApiProperty({ example: 'House rent' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ example: 500000, description: 'Minor units (paisa)' })
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  amountMinor!: number;
}

export class PutSalaryStructureDto {
  @ApiProperty({ example: '2026-07' })
  @Matches(PERIOD_PATTERN, { message: 'effectiveFrom must be YYYY-MM' })
  effectiveFrom!: string;

  @ApiProperty({ example: 3000000 })
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  basicMinor!: number;

  @ApiProperty({ type: [PayComponentDto] })
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => PayComponentDto)
  allowances!: PayComponentDto[];

  @ApiProperty({ type: [PayComponentDto] })
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => PayComponentDto)
  deductions!: PayComponentDto[];

  @ApiPropertyOptional({ description: 'Why the structure changed' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Fixed overtime pay per hour; empty = school rule',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  overtimeRateMinor?: number | null;
}

export class SalaryStructureDto {
  id!: string;
  staffId!: string;
  @ApiProperty({ example: '2026-07' })
  effectiveFrom!: string;
  basicMinor!: number;
  @ApiProperty({ type: [PayComponentDto] })
  allowances!: PayComponentDto[];
  @ApiProperty({ type: [PayComponentDto] })
  deductions!: PayComponentDto[];
  allowancesMinor!: number;
  deductionsMinor!: number;
  @ApiProperty({ description: 'basic + allowances' })
  grossMinor!: number;
  @ApiPropertyOptional({ nullable: true })
  overtimeRateMinor!: number | null;
  reason!: string | null;
  createdBy!: IdNameDto | null;
  createdAt!: string;
}

export class SalaryStructuresDto {
  @ApiPropertyOptional({ type: SalaryStructureDto, nullable: true })
  current!: SalaryStructureDto | null;
  @ApiProperty({ type: [SalaryStructureDto], description: 'Newest first' })
  history!: SalaryStructureDto[];
}
