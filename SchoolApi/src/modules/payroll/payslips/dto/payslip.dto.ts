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

export class PayslipAdjustmentDto {
  @ApiProperty({ enum: ['BONUS', 'DEDUCTION', 'ADVANCE', 'ARREAR'] })
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
  grossMinor!: number;
  workingDays!: number;
  unpaidLeaveDays!: number;
  leaveDeductionMinor!: number;
  @ApiProperty({ type: [PayslipAdjustmentDto] })
  adjustments!: PayslipAdjustmentDto[];
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
