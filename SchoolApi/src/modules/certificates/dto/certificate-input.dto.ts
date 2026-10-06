import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  CertificateStatus,
  CertificateType,
} from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';
import { IsDateOnly } from '../../../core/common/validation/is-date-only';

export class CertificateDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  activityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  achievement?: string;
}

export class CreateCertificateDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty({ enum: CertificateType })
  @IsIn(Object.values(CertificateType))
  type!: CertificateType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  purpose?: string;

  @ApiPropertyOptional({ type: CertificateDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CertificateDetailsDto)
  details?: CertificateDetailsDto;
}

export class CertificateQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ enum: CertificateType })
  @IsOptional()
  @IsIn(Object.values(CertificateType))
  type?: CertificateType;

  @ApiPropertyOptional({ enum: CertificateStatus })
  @IsOptional()
  @IsIn(Object.values(CertificateStatus))
  status?: CertificateStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;
}

export class CertificateReasonDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class IssueCertificateDto {
  @ApiPropertyOptional({ description: 'SCHOOL_LEAVING only; default today' })
  @IsOptional()
  @IsDateOnly()
  effectiveDate?: string;
}
