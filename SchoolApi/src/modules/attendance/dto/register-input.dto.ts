import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AttendanceStatus } from '../../../generated/prisma/client';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../core/common/validation/is-date-only';

export class EntryInputDto {
  @IsUUID()
  studentId!: string;

  @ApiProperty({ enum: AttendanceStatus })
  @IsIn(Object.values(AttendanceStatus))
  status!: AttendanceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  remark?: string;
}

export class RegisterQueryDto {
  @IsUUID()
  sectionId!: string;

  @IsDateOnly()
  date!: string;
}

export class SaveRegisterDto {
  @IsUUID()
  sectionId!: string;

  @IsDateOnly()
  date!: string;

  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => EntryInputDto)
  entries!: EntryInputDto[];

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  clientRequestId?: string;
}

export class SubmitRegisterDto {
  @IsUUID()
  sectionId!: string;

  @IsDateOnly()
  date!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => EntryInputDto)
  entries?: EntryInputDto[];

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  clientRequestId?: string;
}

export class CorrectionInputDto {
  @IsUUID()
  entryId!: string;

  @ApiProperty({ enum: AttendanceStatus })
  @IsIn(Object.values(AttendanceStatus))
  newStatus!: AttendanceStatus;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class StudentAttendanceQueryDto {
  @IsOptionalDateOnly()
  from?: string;

  @IsOptionalDateOnly()
  to?: string;
}

export class BranchDateQueryDto {
  @IsUUID()
  branchId!: string;

  @IsOptionalDateOnly()
  date?: string;
}
