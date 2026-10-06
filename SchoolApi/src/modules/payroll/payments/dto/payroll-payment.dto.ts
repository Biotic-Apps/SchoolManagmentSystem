import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsDateOnly } from '../../../../core/common/validation/is-date-only';

export const SALARY_METHODS = ['CASH', 'BANK', 'CHEQUE', 'ONLINE'] as const;
export type SalaryMethod = (typeof SALARY_METHODS)[number];

export class CreatePayrollPaymentDto {
  @ApiProperty()
  @IsUUID()
  staffId!: string;

  @ApiProperty({
    example: 1500000,
    description: 'Partial allowed; ≤ line balance',
  })
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  amountMinor!: number;

  @ApiProperty({ enum: SALARY_METHODS })
  @IsIn(SALARY_METHODS)
  method!: SalaryMethod;

  @ApiPropertyOptional({
    description: 'Cheque no., bank or transfer reference',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;

  @IsDateOnly()
  paidOn!: string;
}

export class PayrollPaymentDto {
  id!: string;
  amountMinor!: number;
  method!: string;
  reference!: string | null;
  @ApiProperty({ example: '2026-10-01', format: 'date' })
  paidOn!: string;
  createdAt!: string;
}
