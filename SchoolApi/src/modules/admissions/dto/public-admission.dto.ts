import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import type { ApplicationStatus } from '../../../generated/prisma/client';
import { ChildInputDto } from '../../students/dto/child-input.dto';
import { PrimaryGuardianInputDto } from '../../students/dto/guardian-input.dto';

// ── Input DTOs ──────────────────────────────────────────────

export class PublicApplicationInputDto {
  @IsString()
  branchId!: string;

  @IsString()
  sessionId!: string;

  @IsString()
  classId!: string;

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
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

// ── Output DTOs ─────────────────────────────────────────────

export class PublicBranchDto {
  id!: string;
  code!: string;
  name!: string;
}

export class PublicClassDto {
  id!: string;
  name!: string;
  levelOrder!: number;
}

export class PublicSessionDto {
  id!: string;
  name!: string;
  branchId!: string;
}

export class PublicSchoolInfoDto {
  name!: string;
  code!: string;
  address!: string | null;
  phone!: string | null;
  email!: string | null;
  logoUrl!: string | null;
}

export class PublicFormConfigDto {
  school!: PublicSchoolInfoDto;
  branches!: PublicBranchDto[];
  classes!: PublicClassDto[];
  sessions!: PublicSessionDto[];
}

export class PublicApplicationResultDto {
  applicationNo!: string;
  childName!: string;
  className!: string;
  status!: ApplicationStatus;
  createdAt!: string;
}

export class PublicApplicationStatusDto {
  applicationNo!: string;
  childName!: string;
  className!: string;
  status!: ApplicationStatus;
  createdAt!: string;
}
