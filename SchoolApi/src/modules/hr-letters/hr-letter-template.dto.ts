import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  HrLetterTemplateStatus,
  HrLetterType,
} from '../../generated/prisma/client';
import { PaginationQueryDto } from '../../core/common/pagination/pagination-query.dto';

// ── Input DTOs ──

export class CreateHrLetterTemplateDto {
  @ApiProperty()
  @IsUUID()
  schoolId!: string;

  @ApiProperty({ enum: HrLetterType })
  @IsIn(Object.values(HrLetterType))
  type!: HrLetterType;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'Letter body with {{placeholders}}' })
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  bodyTemplate!: string;
}

export class UpdateHrLetterTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Letter body with {{placeholders}}' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  bodyTemplate?: string;

  @ApiPropertyOptional({ enum: HrLetterTemplateStatus })
  @IsOptional()
  @IsIn(Object.values(HrLetterTemplateStatus))
  status?: HrLetterTemplateStatus;
}

export class HrLetterTemplateQueryDto extends PaginationQueryDto {
  @ApiProperty()
  @IsUUID()
  schoolId!: string;

  @ApiPropertyOptional({ enum: HrLetterType })
  @IsOptional()
  @IsIn(Object.values(HrLetterType))
  type?: HrLetterType;

  @ApiPropertyOptional({ enum: HrLetterTemplateStatus })
  @IsOptional()
  @IsIn(Object.values(HrLetterTemplateStatus))
  status?: HrLetterTemplateStatus;
}

// ── Output DTOs ──

export class HrLetterTemplateDto {
  @ApiProperty() id!: string;
  @ApiProperty() schoolId!: string;
  @ApiProperty({ enum: HrLetterType }) type!: HrLetterType;
  @ApiProperty() title!: string;
  @ApiProperty() bodyTemplate!: string;
  @ApiProperty({ enum: HrLetterTemplateStatus })
  status!: HrLetterTemplateStatus;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}
