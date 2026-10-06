import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { NoticeStatus } from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';

export class NoticeAudienceInputDto {
  @IsOptional()
  @IsBoolean()
  schoolWide?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID('all', { each: true })
  branchIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  classIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsUUID('all', { each: true })
  sectionIds?: string[];

  @IsOptional()
  @IsBoolean()
  staffOnly?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @IsUUID('all', { each: true })
  guardianIds?: string[];
}

export class UpdateNoticeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NoticeAudienceInputDto)
  audience?: NoticeAudienceInputDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  attachmentFileIds?: string[];

  @IsOptionalDateOnly()
  expiresOn?: string;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}

export class CreateNoticeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body!: string;

  @ValidateNested()
  @Type(() => NoticeAudienceInputDto)
  audience!: NoticeAudienceInputDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  attachmentFileIds?: string[];

  @IsOptionalDateOnly()
  expiresOn?: string;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}

export class NoticeQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsIn(Object.values(NoticeStatus))
  status?: NoticeStatus;
}
