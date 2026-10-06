import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApplicationStatus } from '../../../generated/prisma/client';
import { ListQueryDto } from '../../../core/common/pagination/list-query.dto';
import { IsDateOnly } from '../../../core/common/validation/is-date-only';
import { ChildInputDto } from '../../students/dto/child-input.dto';
import { PrimaryGuardianInputDto } from '../../students/dto/guardian-input.dto';
import { MedicalInputDto } from '../../students/dto/medical-input.dto';

export class ApplicationFormDto {
  @ValidateNested()
  @Type(() => ChildInputDto)
  child!: ChildInputDto;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => PrimaryGuardianInputDto)
  guardians!: PrimaryGuardianInputDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalInputDto)
  medical?: MedicalInputDto;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class ApplicationInputDto extends ApplicationFormDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  sessionId!: string;

  @IsUUID()
  classId!: string;
}

/** Replaces the form fields given (only before OFFERED). */
export class UpdateApplicationDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ChildInputDto)
  child?: ChildInputDto;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => PrimaryGuardianInputDto)
  guardians?: PrimaryGuardianInputDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalInputDto)
  medical?: MedicalInputDto;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class ApplicationQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;
}

export class WaitlistQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;
}

export class ScheduleTestDto {
  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  venue?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class TestResultDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  score!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  maxScore!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remarks?: string;
}

export class DecideApplicationDto {
  @IsIn(['OFFER', 'WAITLIST', 'REJECT'])
  decision!: 'OFFER' | 'WAITLIST' | 'REJECT';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}

export class AdmissionFeeDto {
  @IsIn(['PAID', 'WAIVED', 'PENDING'])
  status!: 'PAID' | 'WAIVED' | 'PENDING';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  amountMinor?: number;
}

export class ConfirmApplicationDto {
  @ValidateNested()
  @Type(() => AdmissionFeeDto)
  admissionFee!: AdmissionFeeDto;

  @IsUUID()
  sectionId!: string;

  @IsDateOnly()
  admissionDate!: string;
}

export class WithdrawApplicationDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export const OPEN_STATUSES: ApplicationStatus[] = [
  'SUBMITTED',
  'DOCUMENTS_PENDING',
  'TEST_SCHEDULED',
  'TEST_COMPLETED',
  'OFFERED',
  'WAITLISTED',
];

export const EDITABLE_STATUSES: ApplicationStatus[] = [
  'SUBMITTED',
  'DOCUMENTS_PENDING',
  'TEST_SCHEDULED',
  'TEST_COMPLETED',
];

export const STATUS_VALUES = Object.values(ApplicationStatus);
