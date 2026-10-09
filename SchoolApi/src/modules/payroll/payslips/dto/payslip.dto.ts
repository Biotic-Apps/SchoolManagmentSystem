import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';
import { PayrollLineStatus } from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';
import { PayrollPaymentDto } from '../../payments/dto/payroll-payment.dto';
import {
  PayComponentDto,
  PERIOD_PATTERN,
} from '../../structures/dto/salary-structure.dto';

export class PayslipQueryDto {
  @ApiPropertyOptional({
    example: '2026-09',
    description: 'Defaults to the latest approved month',
  })
  @IsOptional()
  @Matches(PERIOD_PATTERN, { message: 'month must be YYYY-MM' })
  month?: string;
}

export class PayslipStaffDto {
  id!: string;
  name!: string;
  designation!: string;
  employeeNo!: string | null;
}

export class BreakdownItemDto {
  label!: string;
  @ApiPropertyOptional({ nullable: true, description: 'How it was worked out' })
  note!: string | null;
  amountMinor!: number;
}

export class AttendanceSummaryDto {
  calendarDays!: number;
  payDays!: number;
  present!: number;
  late!: number;
  absent!: number;
  halfDays!: number;
  paidLeave!: number;
  unpaidLeave!: number;
  unmarked!: number;
  @ApiProperty({ enum: ['GROSS', 'BASIC'] })
  perDayBase!: string;
  perDayMinor!: number;
  absenceHalfDays!: number;
  absenceDeductionMinor!: number;
  latesPerDeduction!: number;
  lateDeductionDays!: number;
  lateHalfDays!: number;
  lateDeductionMinor!: number;
}

export class OvertimeSummaryDto {
  minutes!: number;
  hourlyRateMinor!: number;
  @ApiPropertyOptional({ nullable: true })
  multiplier!: number | null;
  dailyHours!: number;
  amountMinor!: number;
  entryIds!: string[];
  pendingMinutes!: number;
}

export class PayBreakdownDto {
  @ApiProperty({ type: [BreakdownItemDto] })
  earnings!: BreakdownItemDto[];
  @ApiProperty({ type: [BreakdownItemDto] })
  deductions!: BreakdownItemDto[];
  totalEarningsMinor!: number;
  totalDeductionsMinor!: number;
  @ApiPropertyOptional({ type: AttendanceSummaryDto, nullable: true })
  attendance!: AttendanceSummaryDto | null;
  @ApiPropertyOptional({ type: OvertimeSummaryDto, nullable: true })
  overtime!: OvertimeSummaryDto | null;
}

export class PayslipAdjustmentDto {
  @ApiProperty({ enum: ['BONUS', 'DEDUCTION', 'ADVANCE', 'ARREAR', 'FINE'] })
  kind!: string;
  amountMinor!: number;
  @ApiProperty({ description: 'Effect on net pay' })
  signedMinor!: number;
  reason!: string;
}

export class PayslipPdfDto {
  @ApiProperty({ enum: ['PENDING', 'READY', 'FAILED'] })
  status!: string;
  fileUrl!: string | null;
  generatedAt!: string | null;
}

export class PayslipDto {
  staff!: PayslipStaffDto;
  month!: string;
  branch!: IdNameDto;
  currency!: string;
  basicMinor!: number;
  @ApiProperty({ type: [PayComponentDto] })
  allowances!: PayComponentDto[];
  @ApiProperty({ type: [PayComponentDto] })
  deductions!: PayComponentDto[];
  allowancesMinor!: number;
  deductionsMinor!: number;
  grossMinor!: number;
  workingDays!: number;
  unpaidLeaveDays!: number;
  leaveDeductionMinor!: number;
  @ApiProperty({ type: [PayslipAdjustmentDto] })
  adjustments!: PayslipAdjustmentDto[];
  @ApiProperty({ description: 'Signed sum of adjustments' })
  adjustmentsMinor!: number;
  overtimeMinutes!: number;
  overtimeMinor!: number;
  @ApiProperty({ type: PayBreakdownDto })
  breakdown!: PayBreakdownDto;
  netMinor!: number;
  paidMinor!: number;
  balanceMinor!: number;
  @ApiProperty({ type: [PayrollPaymentDto] })
  payments!: PayrollPaymentDto[];
  @ApiProperty({ enum: PayrollLineStatus })
  status!: PayrollLineStatus;
  @ApiPropertyOptional({ type: PayslipPdfDto, nullable: true })
  pdf!: PayslipPdfDto | null;
}
