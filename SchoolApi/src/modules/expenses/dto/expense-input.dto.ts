import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Equals,
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
  ValidateNested,
} from 'class-validator';
import { ExpenseStatus, PaymentMethod } from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../core/common/validation/is-date-only';

export const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export class RecurringInputDto {
  @ApiProperty({ example: true })
  @Equals(true)
  monthly!: true;

  @ApiPropertyOptional({
    example: '2027-03',
    description: 'Last month (YYYY-MM)',
  })
  @IsOptional()
  @Matches(MONTH, { message: 'untilMonth must be YYYY-MM' })
  untilMonth?: string;
}

export class CreateExpenseDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  amountMinor!: number;

  @IsDateOnly()
  billDate!: string;

  @IsOptionalDateOnly()
  dueDate?: string;

  @IsOptional()
  @IsUUID()
  billFileId?: string;

  @ApiPropertyOptional({ type: RecurringInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurringInputDto)
  recurring?: RecurringInputDto;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateExpenseDto extends PartialType(
  OmitType(CreateExpenseDto, ['branchId'] as const),
) {}

export class ExpenseQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional({ enum: ExpenseStatus })
  @IsOptional()
  @IsIn(Object.values(ExpenseStatus))
  status?: ExpenseStatus;

  @ApiPropertyOptional({ description: 'Bill date from (inclusive)' })
  @IsOptionalDateOnly()
  from?: string;

  @ApiPropertyOptional({ description: 'Bill date to (inclusive)' })
  @IsOptionalDateOnly()
  to?: string;
}

export class ExpensePaymentInputDto {
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  amountMinor!: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsIn(Object.values(PaymentMethod))
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @IsDateOnly()
  paidOn!: string;
}
