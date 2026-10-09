import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { SkillDomain } from '../../../../generated/prisma/client';

export class SkillItemDto {
  id!: string;
  @ApiProperty({ enum: SkillDomain })
  domain!: SkillDomain;
  name!: string;
  sortOrder!: number;
}

export class SkillScaleLevelDto {
  /** 1 = lowest. */
  value!: number;
  /** Printed on the card, e.g. "A" or "5". */
  code!: string;
  label!: string;
}

export class SkillConfigDto {
  branchId!: string;
  @ApiProperty({ type: [SkillItemDto] })
  items!: SkillItemDto[];
  @ApiProperty({ type: [SkillScaleLevelDto], description: 'Highest first' })
  scale!: SkillScaleLevelDto[];
}

export class SkillItemInputDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsEnum(SkillDomain)
  domain!: SkillDomain;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;
}

export class SkillLevelInputDto {
  @IsInt()
  @Min(1)
  @Max(10)
  value!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(4)
  code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(40)
  label!: string;
}

export class UpdateSkillConfigDto {
  @ApiProperty({
    type: [SkillItemInputDto],
    description: 'Order within a domain = order on the card',
  })
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => SkillItemInputDto)
  items!: SkillItemInputDto[];

  @ApiProperty({ type: [SkillLevelInputDto], description: 'Values 1..N' })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => SkillLevelInputDto)
  scale!: SkillLevelInputDto[];
}

export class SkillGridQueryDto {
  @IsUUID()
  sectionId!: string;
}

export class SkillStudentRowDto {
  studentId!: string;
  name!: string;
  rollNo!: number | null;
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'integer' },
    description: 'itemId → scale value',
  })
  ratings!: Record<string, number>;
}

export class SkillGridDto {
  examId!: string;
  sectionId!: string;
  /** False once the exam is published or for read-only callers. */
  editable!: boolean;
  @ApiProperty({ type: [SkillItemDto] })
  items!: SkillItemDto[];
  @ApiProperty({ type: [SkillScaleLevelDto] })
  scale!: SkillScaleLevelDto[];
  @ApiProperty({ type: [SkillStudentRowDto] })
  students!: SkillStudentRowDto[];
  /** Students with every item rated. */
  complete!: number;
}

export class SkillRatingInputDto {
  @IsUUID()
  studentId!: string;

  @IsUUID()
  itemId!: string;

  @ApiProperty({ type: Number, nullable: true, description: 'null clears' })
  @ValidateIf((_o, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(10)
  value!: number | null;
}

export class SaveSkillRatingsDto {
  @IsUUID()
  sectionId!: string;

  @ApiProperty({ type: [SkillRatingInputDto] })
  @IsArray()
  @ArrayMaxSize(4000)
  @ValidateNested({ each: true })
  @Type(() => SkillRatingInputDto)
  ratings!: SkillRatingInputDto[];
}

/** One rated item on a report card / parent result. */
export class StudentSkillDto {
  @ApiProperty({ enum: SkillDomain })
  domain!: SkillDomain;
  name!: string;
  value!: number;
  code!: string;
  label!: string;
}
