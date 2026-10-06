import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, Matches } from 'class-validator';

export class FinanceDashboardQueryDto {
  /** Default: all branches the caller manages. */
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  /** `YYYY-MM`; default the current month (school time zone). */
  @ApiPropertyOptional({ example: '2026-10' })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'month must be YYYY-MM' })
  month?: string;
}

export class FinanceDashboardDto {
  branchId!: string | null;
  month!: string;
  billedMinor!: number;
  collectedMinor!: number;
  outstandingMinor!: number;
  overdueMinor!: number;
  /** collected / billed, 2 decimals (0.87 = 87%). */
  collectionRate!: number;
  expensesMinor!: number;
  payrollMinor!: number;
  todayCollectedMinor!: number;
  currency!: string;
}
