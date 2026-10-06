import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  HomeworkCompletion,
  ProgressCategory,
} from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';
import { IsOptionalDateOnly } from '../../../../core/common/validation/is-date-only';

export class CreateProgressNoteDto {
  @ApiProperty({ enum: ProgressCategory })
  @IsIn(Object.values(ProgressCategory))
  category!: ProgressCategory;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  note!: string;

  @IsBoolean()
  visibleToParent!: boolean;
}

export class ProgressNoteDto {
  id!: string;
  studentId!: string;
  sectionId!: string;
  @ApiProperty({ enum: ProgressCategory })
  category!: ProgressCategory;
  note!: string;
  visibleToParent!: boolean;
  author!: IdNameDto;
  onBehalfOfStaffId!: string | null;
  createdAt!: string;
}

export class ProgressNoteResultDto {
  @ApiProperty({ enum: ['APPLIED', 'PENDING_REVIEW'] })
  status!: 'APPLIED' | 'PENDING_REVIEW';
  approvalId!: string | null;
  note!: ProgressNoteDto | null;
}

export class HomeworkStatusEntryDto {
  @IsUUID()
  studentId!: string;

  @ApiProperty({ enum: HomeworkCompletion })
  @IsIn(Object.values(HomeworkCompletion))
  status!: HomeworkCompletion;
}

export class SaveHomeworkStatusDto {
  @ApiProperty({ type: [HomeworkStatusEntryDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => HomeworkStatusEntryDto)
  entries!: HomeworkStatusEntryDto[];
}

export class HomeworkRosterRowDto {
  studentId!: string;
  name!: string;
  rollNo!: number | null;
  @ApiProperty({ enum: HomeworkCompletion, nullable: true })
  status!: HomeworkCompletion | null;
}

export class HomeworkStatusDto {
  diaryEntryId!: string;
  @ApiProperty({ type: [HomeworkRosterRowDto] })
  entries!: HomeworkRosterRowDto[];
}

export class HomeworkCompletionQueryDto {
  @IsOptionalDateOnly()
  from?: string;

  @IsOptionalDateOnly()
  to?: string;
}

export class HomeworkItemDto {
  diaryEntryId!: string;
  date!: string;
  dueDate!: string | null;
  subject!: IdNameDto;
  homework!: string;
  @ApiProperty({ enum: HomeworkCompletion, nullable: true })
  status!: HomeworkCompletion | null;
}

export class HomeworkSummaryDto {
  total!: number;
  done!: number;
  partial!: number;
  notDone!: number;
  unmarked!: number;
}

export class HomeworkCompletionDto {
  studentId!: string;
  from!: string;
  to!: string;
  @ApiProperty({ type: [HomeworkItemDto] })
  entries!: HomeworkItemDto[];
  summary!: HomeworkSummaryDto;
}
