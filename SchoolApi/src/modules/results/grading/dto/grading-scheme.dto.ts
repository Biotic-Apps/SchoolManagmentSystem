import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { GradingSchemeStatus } from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';

export class GradeBandInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5)
  grade!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  minPercent!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  maxPercent!: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99.99)
  gradePoint?: number;
}

export class UpdateGradingSchemeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passPercent?: number;

  @ApiPropertyOptional({ type: [GradeBandInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => GradeBandInputDto)
  bands?: GradeBandInputDto[];
}

export class CreateGradingSchemeDto {
  @IsUUID()
  schoolId!: string;

  @IsUUID()
  sessionId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  passPercent!: number;

  @ApiProperty({ type: [GradeBandInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => GradeBandInputDto)
  bands!: GradeBandInputDto[];
}

export class GradingSchemeQueryDto {
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;
}

export class GradeBandDto {
  grade!: string;
  minPercent!: number;
  maxPercent!: number;
  remark!: string | null;
  gradePoint!: number | null;
}

export class GradingSchemeDto {
  id!: string;
  schoolId!: string;
  sessionId!: string;
  name!: string;
  passPercent!: number;
  @ApiProperty({ enum: GradingSchemeStatus })
  status!: GradingSchemeStatus;
  approvedBy!: IdNameDto | null;
  approvedAt!: string | null;
  createdById!: string;
  bands!: GradeBandDto[];
  createdAt!: string;
}
