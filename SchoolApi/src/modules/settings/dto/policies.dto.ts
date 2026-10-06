import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { TIME_24H } from '../../../core/common/validation/is-time';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import {
  PASSWORD_MIN_LENGTH_RANGE,
  SESSION_TIMEOUT_RANGE,
} from '../../../core/school-settings/school-policies';

export class LateFeeDefaultDto {
  @ApiProperty() @IsInt() @Min(0) amountMinor!: number;
  @ApiProperty() @IsInt() @Min(0) @Max(365) afterDays!: number;
}

export class PasswordPolicyDto {
  @ApiPropertyOptional({ minimum: 8, maximum: 64 })
  @IsOptional()
  @IsInt()
  @Min(PASSWORD_MIN_LENGTH_RANGE.min)
  @Max(PASSWORD_MIN_LENGTH_RANGE.max)
  minLength?: number;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() requireDigit?: boolean;
}

export class PoliciesDto {
  @ApiProperty({ example: '11:00' }) attendanceLockTime!: string;
  @ApiProperty() diaryModeration!: boolean;
  @ApiProperty({ nullable: true, type: String }) gradingDefault!: string | null;
  @ApiProperty({ nullable: true, type: LateFeeDefaultDto })
  feeLateFeeDefault!: LateFeeDefaultDto | null;
  @ApiProperty({ example: { CONCESSION: 2500000 } })
  approvalLimits!: Record<string, number>;
  @ApiProperty({ type: PasswordPolicyDto }) passwordPolicy!: PasswordPolicyDto;
  @ApiProperty() sessionTimeoutMinutes!: number;
  @ApiProperty({ enum: RoleKey, isArray: true })
  twoFactorRequiredFor!: RoleKey[];
}

/** PATCH: top-level fields merge; `approvalLimits` replaces the whole map. */
export class UpdatePoliciesDto {
  @ApiPropertyOptional({ example: '11:00' })
  @IsOptional()
  @Matches(TIME_24H, { message: 'attendanceLockTime must be HH:mm (24-hour)' })
  attendanceLockTime?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() diaryModeration?: boolean;

  @ApiPropertyOptional({ nullable: true, format: 'uuid' })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUUID()
  gradingDefault?: string | null;

  @ApiPropertyOptional({ nullable: true, type: LateFeeDefaultDto })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @ValidateNested()
  @Type(() => LateFeeDefaultDto)
  feeLateFeeDefault?: LateFeeDefaultDto | null;

  /** Keys and amounts are checked in the service. */
  @ApiPropertyOptional({ example: { CONCESSION: 2500000 } })
  @IsOptional()
  @IsObject()
  approvalLimits?: Record<string, number>;

  @ApiPropertyOptional({ type: PasswordPolicyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PasswordPolicyDto)
  passwordPolicy?: PasswordPolicyDto;

  @ApiPropertyOptional({ minimum: 5, maximum: 1440 })
  @IsOptional()
  @IsInt()
  @Min(SESSION_TIMEOUT_RANGE.min)
  @Max(SESSION_TIMEOUT_RANGE.max)
  sessionTimeoutMinutes?: number;

  @ApiPropertyOptional({ enum: RoleKey, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(RoleKey, { each: true })
  twoFactorRequiredFor?: RoleKey[];
}
