import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { HrLetterType } from '../../generated/prisma/client';
import { IsOptionalDateOnly } from '../../core/common/validation/is-date-only';

// ── Input DTOs ──

export class GenerateHrLetterDto {
  @ApiProperty()
  @IsUUID()
  templateId!: string;

  @ApiPropertyOptional({ description: 'Override subject line' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  subject?: string;

  @ApiPropertyOptional({ description: 'Effective date for the letter content' })
  @IsOptionalDateOnly()
  effectiveDate?: string;
}

// ── Output DTOs ──

export class HrLetterStaffDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() designation!: string;
}

export class HrLetterDto {
  @ApiProperty() id!: string;
  @ApiProperty() schoolId!: string;
  @ApiProperty() staffId!: string;
  @ApiProperty() templateId!: string;
  @ApiProperty({ enum: HrLetterType }) type!: HrLetterType;
  @ApiProperty() subject!: string;
  @ApiProperty() body!: string;
  @ApiProperty({ type: HrLetterStaffDto }) staff!: HrLetterStaffDto;
  @ApiProperty({ nullable: true }) fileUrl!: string | null;
  @ApiProperty() issuedAt!: string;
  @ApiProperty() createdAt!: string;
}
