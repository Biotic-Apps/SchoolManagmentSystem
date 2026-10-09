import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class PayrollStaffQueryDto {
  @ApiProperty()
  @IsUUID()
  branchId!: string;

  @ApiPropertyOptional({ example: 'HELPER', description: 'Staff type' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  designation?: string;
}

export class PrincipalPayrollDto {
  @ApiProperty()
  @IsUUID()
  branchId!: string;
}

export class StaffSalarySummaryDto {
  effectiveFrom!: string;
  basicMinor!: number;
  allowancesMinor!: number;
  deductionsMinor!: number;
  grossMinor!: number;
  @ApiPropertyOptional({ nullable: true })
  overtimeRateMinor!: number | null;
}

export class PayrollStaffRowDto {
  staffId!: string;
  name!: string;
  designation!: string;
  employeeNo!: string | null;
  status!: string;
  @ApiPropertyOptional({ type: StaffSalarySummaryDto, nullable: true })
  salary!: StaffSalarySummaryDto | null;
}

export class BranchPrincipalDto {
  userId!: string;
  name!: string;
  @ApiPropertyOptional({
    nullable: true,
    description: 'Null = not on payroll yet',
  })
  staffId!: string | null;
}

export class PayrollStaffListDto {
  @ApiProperty({ type: [PayrollStaffRowDto] })
  items!: PayrollStaffRowDto[];
  @ApiProperty({ description: 'Active staff without a salary' })
  missingCount!: number;
  @ApiPropertyOptional({ type: BranchPrincipalDto, nullable: true })
  principal!: BranchPrincipalDto | null;
}
