import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { MarkSheetStatus } from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';

export class MarkSheetQueryDto {
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;
}

export class CompletenessQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class MarkRowInputDto {
  @IsUUID()
  studentId!: string;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'null = pending (never zero)',
  })
  @ValidateIf((_o, value) => value !== null)
  @IsNumber({ maxDecimalPlaces: 2 })
  marks!: number | null;

  @IsBoolean()
  absent!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  remark?: string;
}

export class SaveMarksDto {
  @ApiProperty({ type: [MarkRowInputDto] })
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => MarkRowInputDto)
  rows!: MarkRowInputDto[];

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  clientRequestId?: string;
}

export class SheetDecisionDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export class MarkRowDto {
  studentId!: string;
  name!: string;
  rollNo!: number | null;
  marks!: number | null;
  absent!: boolean;
  remark!: string | null;
}

export class MarkSheetPaperDto {
  classId!: string;
  className!: string;
  subject!: IdNameDto;
  maxMarks!: number;
  passMarks!: number;
  date!: string;
}

export class MarkSheetDto {
  id!: string;
  examId!: string;
  paper!: MarkSheetPaperDto;
  sectionId!: string;
  sectionName!: string;
  @ApiProperty({ enum: MarkSheetStatus })
  status!: MarkSheetStatus;
  teacher!: IdNameDto | null;
  entered!: number;
  total!: number;
  comment!: string | null;
  /** Pending probation review of the submission. */
  approvalId!: string | null;
  /** Empty in lists; filled by detail and actions. */
  rows!: MarkRowDto[];
}

export class CompletenessRowDto {
  sheetId!: string;
  classId!: string;
  className!: string;
  sectionId!: string;
  sectionName!: string;
  subjectId!: string;
  subjectName!: string;
  @ApiProperty({ enum: MarkSheetStatus })
  status!: MarkSheetStatus;
  entered!: number;
  total!: number;
}
