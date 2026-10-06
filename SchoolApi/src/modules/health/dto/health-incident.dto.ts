import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from '../../../generated/prisma/client';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';
import type { AllergyDto } from './health-profile.dto';

export class CreateIncidentDto {
  @IsUUID()
  studentId!: string;

  @IsISO8601({ strict: true })
  occurredAt!: string;

  @IsIn(Object.values(IncidentType))
  type!: IncidentType;

  @IsIn(Object.values(IncidentSeverity))
  severity!: IncidentSeverity;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  actionTaken!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  attachmentFileIds?: string[];
}

export class IncidentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptionalDateOnly()
  from?: string;

  @IsOptionalDateOnly()
  to?: string;
}

export class CloseIncidentDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class AlertQueryDto {
  @IsUUID()
  sectionId!: string;
}

export class RefDto {
  id!: string;
  name!: string;
}

export class AttachmentDto {
  id!: string;
  url!: string;
  mime!: string;
  name!: string;
}

export class IncidentDto {
  id!: string;
  student!: RefDto;
  occurredAt!: string;
  type!: IncidentType;
  severity!: IncidentSeverity;
  description!: string;
  actionTaken!: string;
  attachments!: AttachmentDto[];
  status!: IncidentStatus;
  reportedBy!: RefDto;
  closedAt!: string | null;
  closeNote!: string | null;
  createdAt!: string;
}

export class HealthAlertDto {
  studentId!: string;
  name!: string;
  rollNo!: number | null;
  allergies!: AllergyDto[];
  instructions!: string | null;
}
