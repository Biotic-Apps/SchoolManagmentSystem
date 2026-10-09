import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class PayrollSettingsQueryDto {
  @ApiProperty({ description: 'Any branch of the school' })
  @IsUUID()
  branchId!: string;
}

export class PayrollSettingsDto {
  @ApiProperty({ enum: ['CALENDAR', 'FIXED'] })
  @IsIn(['CALENDAR', 'FIXED'])
  workingDaysMode!: 'CALENDAR' | 'FIXED';

  @ApiProperty({ example: 26 })
  @IsInt()
  @Min(1)
  @Max(31)
  fixedWorkingDays!: number;

  @ApiProperty({ enum: ['GROSS', 'BASIC'] })
  @IsIn(['GROSS', 'BASIC'])
  perDayBase!: 'GROSS' | 'BASIC';

  @ApiProperty({ example: 3, description: '0 = lates never deduct' })
  @IsInt()
  @Min(0)
  @Max(31)
  latesPerDeduction!: number;

  @ApiProperty({
    example: 1,
    description: 'Days deducted per block (0.5 steps)',
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  lateDeductionDays!: number;

  @ApiProperty()
  @IsBoolean()
  overtimeEnabled!: boolean;

  @ApiProperty({ example: 1.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.5)
  @Max(5)
  overtimeMultiplier!: number;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(0)
  @Max(240)
  overtimeGraceMinutes!: number;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Paid hours a day; null = branch staff timings',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(16)
  dailyHours!: number | null;
}

export class PayrollSettingsViewDto extends PayrollSettingsDto {
  @ApiPropertyOptional({
    nullable: true,
    description: 'Daily hours from the branch staff timings',
  })
  branchDailyHours!: number | null;
  @ApiPropertyOptional({ example: '07:30', nullable: true })
  staffArrivesAt!: string | null;
  @ApiPropertyOptional({ example: '14:00', nullable: true })
  staffLeavesAt!: string | null;
  @ApiProperty({ description: 'False until the school saves its own rules' })
  saved!: boolean;
}
