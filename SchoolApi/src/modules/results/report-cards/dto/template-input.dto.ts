import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../core/common/pagination/pagination-query.dto';

export class TemplateLayoutDto {
  @ApiPropertyOptional({ default: 'portrait' })
  @IsOptional()
  @IsString()
  orientation?: string;

  @ApiPropertyOptional({ default: 'A4' })
  @IsOptional()
  @IsString()
  paperSize?: string;
}

export class TemplateHeaderDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  showLogo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  schoolName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;
}

export class CreateReportCardTemplateDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ type: TemplateLayoutDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateLayoutDto)
  layout?: TemplateLayoutDto;

  @ApiPropertyOptional({ type: TemplateHeaderDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateHeaderDto)
  header?: TemplateHeaderDto;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  showGradingScale?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  showSkills?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  showRemarks?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  showAttendance?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  showPosition?: boolean;

  @ApiPropertyOptional({
    type: [String],
    default: ['Class teacher', 'Principal', 'Parent / guardian'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  signatures?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  remarkLabels?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  footerText?: string;
}

export class UpdateReportCardTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ type: TemplateLayoutDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateLayoutDto)
  layout?: TemplateLayoutDto;

  @ApiPropertyOptional({ type: TemplateHeaderDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateHeaderDto)
  header?: TemplateHeaderDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showGradingScale?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showSkills?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showRemarks?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showAttendance?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showPosition?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  signatures?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  remarkLabels?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  footerText?: string;
}

export class TemplateQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
