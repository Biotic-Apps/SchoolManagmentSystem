import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsDateOnly } from '../../../../core/common/validation/is-date-only';
import { IsTime } from '../../../../core/common/validation/is-time';

export class SchedulePaperDto {
  @IsUUID()
  classId!: string;

  @IsUUID()
  subjectId!: string;

  @IsDateOnly()
  date!: string;

  @IsTime()
  startTime!: string;

  @IsTime()
  endTime!: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  maxMarks!: number;

  @IsInt()
  @Min(0)
  @Max(1000)
  passMarks!: number;

  @IsOptional()
  @IsUUID()
  roomId?: string;
}

export class ScheduleExamDto {
  @ApiProperty({ type: [SchedulePaperDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => SchedulePaperDto)
  papers!: SchedulePaperDto[];
}
