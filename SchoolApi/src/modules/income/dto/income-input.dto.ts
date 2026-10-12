import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';
import { IsDateOnly, IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';

export class CreateIncomeDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  categoryId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  amountMinor!: number;

  @IsDateOnly()
  receivedOn!: string;

  @IsOptional()
  @IsUUID()
  receiptFileId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateIncomeDto extends PartialType(
  OmitType(CreateIncomeDto, ['branchId'] as const),
) {}

export class IncomeQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Received from (inclusive)' })
  @IsOptionalDateOnly()
  from?: string;

  @ApiPropertyOptional({ description: 'Received to (inclusive)' })
  @IsOptionalDateOnly()
  to?: string;
}
