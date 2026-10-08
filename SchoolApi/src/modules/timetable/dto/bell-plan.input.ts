import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { IsTime } from '../../../core/common/validation/is-time';

export class BellDayPlanInput {
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(120)
  periodMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  periodsPerDay?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  breakMinutes?: number;
}

/** Bell schedule generator input (setup wizard and preview). */
export class BellPlanInput {
  @IsOptional()
  @IsTime()
  startTime?: string;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(120)
  periodMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  periodsPerDay?: number;

  /** Break after this period; 0 = no break. */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(11)
  breakAfter?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  breakMinutes?: number;

  /** Shorter Friday (applied only when Friday is a working day). */
  @IsOptional()
  @ValidateNested()
  @Type(() => BellDayPlanInput)
  friday?: BellDayPlanInput;
}
