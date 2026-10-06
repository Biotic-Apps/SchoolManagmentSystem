import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, Matches } from 'class-validator';
import {
  ApprovalStatus,
  PayrollLineStatus,
  PayrollRunStatus,
} from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';
import { PaginationQueryDto } from '../../../../core/common/pagination/pagination-query.dto';
import { PERIOD_PATTERN } from '../../structures/dto/salary-structure.dto';

export class CreateRunDto {
  @ApiProperty()
  @IsUUID()
  branchId!: string;

  @ApiProperty({ example: '2026-09' })
  @Matches(PERIOD_PATTERN, { message: 'month must be YYYY-MM' })
  month!: string;
}

export class RunQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ example: '2026-09' })
  @IsOptional()
  @Matches(PERIOD_PATTERN, { message: 'month must be YYYY-MM' })
  month?: string;
}

export class PayrollLineDto {
  id!: string;
  staffId!: string;
  name!: string;
  designation!: string;
  employeeNo!: string | null;
  basicMinor!: number;
  allowancesMinor!: number;
  deductionsMinor!: number;
  workingDays!: number;
  @ApiProperty({ example: 1.5 })
  unpaidLeaveDays!: number;
  leaveDeductionMinor!: number;
  @ApiProperty({ description: 'Signed sum of adjustments' })
  adjustmentsMinor!: number;
  netMinor!: number;
  paidMinor!: number;
  balanceMinor!: number;
  @ApiProperty({ enum: PayrollLineStatus })
  status!: PayrollLineStatus;
  @ApiProperty({ enum: ['BRANCH', 'SUPER_ADMIN'] })
  route!: string;
  approvalId!: string | null;
}

export class PayrollTotalsDto {
  netMinor!: number;
  paidMinor!: number;
  balanceMinor!: number;
}

export class RunApprovalDto {
  id!: string;
  @ApiProperty({ enum: ApprovalStatus })
  status!: ApprovalStatus;
}

export class PayrollRunDto {
  id!: string;
  branch!: IdNameDto;
  month!: string;
  @ApiProperty({ enum: PayrollRunStatus })
  status!: PayrollRunStatus;
  currency!: string;
  calculatedAt!: string | null;
  calculatedBy!: IdNameDto | null;
  reviewedAt!: string | null;
  reviewedBy!: IdNameDto | null;
  approvedAt!: string | null;
  approvedBy!: IdNameDto | null;
  closedAt!: string | null;
  @ApiPropertyOptional({ type: RunApprovalDto, nullable: true })
  approval!: RunApprovalDto | null;
  totals!: PayrollTotalsDto;
  @ApiProperty({ type: [PayrollLineDto] })
  lines!: PayrollLineDto[];
  version!: number;
  createdAt!: string;
}

export class PayrollJobDto {
  jobId!: string;
}
