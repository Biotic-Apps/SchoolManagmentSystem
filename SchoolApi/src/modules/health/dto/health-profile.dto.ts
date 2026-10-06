import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export const ALLERGY_SEVERITIES = ['MILD', 'MODERATE', 'SEVERE'] as const;
export type AllergySeverity = (typeof ALLERGY_SEVERITIES)[number];

export class AllergyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsIn(ALLERGY_SEVERITIES)
  severity!: AllergySeverity;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reaction!: string | null;
}

export class MedicationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  dose!: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  schedule!: string | null;
}

export class DoctorDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  phone!: string;
}

export class EmergencyContactDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  relation!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  phone!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  priority!: number;
}

/** Full profile body of PUT /students/:id/health. */
export class HealthProfileInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(5)
  bloodGroup?: string | null;

  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => AllergyDto)
  allergies!: AllergyDto[];

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  conditions!: string[];

  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications!: MedicationDto[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => DoctorDto)
  doctor?: DoctorDto | null;

  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts!: EmergencyContactDto[];
}

/** `Partial<HealthProfile>` proposed by a parent; only given keys change. */
export class HealthChangesDto {
  @IsOptional()
  @IsString()
  @MaxLength(5)
  bloodGroup?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => AllergyDto)
  allergies?: AllergyDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  conditions?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications?: MedicationDto[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => DoctorDto)
  doctor?: DoctorDto | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts?: EmergencyContactDto[];
}

export class HealthChangeRequestDto {
  @ValidateNested()
  @Type(() => HealthChangesDto)
  changes!: HealthChangesDto;
}

export class HealthChangeResultDto {
  approvalId!: string;
  status!: string;
}

export class HealthProfileDto {
  bloodGroup!: string | null;
  allergies!: AllergyDto[];
  conditions!: string[];
  medications!: MedicationDto[];
  instructions!: string | null;
  doctor!: DoctorDto | null;
  emergencyContacts!: EmergencyContactDto[];
  updatedAt!: string | null;
}
