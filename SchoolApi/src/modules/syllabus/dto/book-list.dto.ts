import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import type { BookListStatus } from '../../../generated/prisma/client';

export class BookItemInputDto {
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  author?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  publisher?: string;

  @IsOptional()
  @Matches(/^[0-9Xx-]{10,17}$/, { message: 'isbn must be an ISBN-10/13' })
  isbn?: string;

  @IsBoolean()
  isMandatory!: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceMinor?: number;
}

export class BookListDraftDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  sessionId!: string;

  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => BookItemInputDto)
  items!: BookItemInputDto[];
}

export class BookListQueryDto {
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

export class CommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export class BookItemDto {
  id!: string;
  subjectId!: string | null;
  title!: string;
  author!: string | null;
  publisher!: string | null;
  isbn!: string | null;
  isMandatory!: boolean;
  priceMinor!: number | null;
}

export class BookListDto {
  id!: string;
  branchId!: string;
  sessionId!: string;
  classId!: string;
  className!: string;
  revision!: number;
  status!: BookListStatus;
  items!: BookItemDto[];
  approvedAt!: string | null;
  comment!: string | null;
}
