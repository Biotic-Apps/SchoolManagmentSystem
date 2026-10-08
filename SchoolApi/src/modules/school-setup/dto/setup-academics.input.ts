import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { BellPlanInput } from '../../timetable/dto/bell-plan.input';
import { MAX_SETUP_CLASSES } from '../steps/curriculum-plan';
import { SetupClassInput } from './setup-classes.input';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';
import {
  MAX_SECTIONS_PER_CLASS,
  PRESET_CLASS_NAMES,
  PRESET_NAMES,
  PRESET_SUBJECT_NAMES,
} from '../presets';

export class SetupAcademicsInput {
  /** Default true: active session + classes, sections and subjects. */
  @IsOptional()
  @IsBoolean()
  createSession?: boolean;

  /** Default from the dates, e.g. "2026-27". */
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  sessionName?: string;

  /** Default 1 April of the current school year (Asia/Karachi). */
  @IsOptionalDateOnly()
  startDate?: string;

  /** Default 31 March of the following year. */
  @IsOptionalDateOnly()
  endDate?: string;

  /** Default STANDARD: Playgroup, Nursery, Prep, Class 1 … Class 10. */
  @IsOptional()
  @IsIn(PRESET_NAMES)
  classesPreset?: (typeof PRESET_NAMES)[number];

  /** 1–4, default 1 (sections A, B, …). */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_SECTIONS_PER_CLASS)
  sectionsPerClass?: number;

  /** Default STANDARD (8 subjects). */
  @IsOptional()
  @IsIn(PRESET_NAMES)
  subjectsPreset?: (typeof PRESET_NAMES)[number];

  /** Partial pick from the STANDARD classes; overrides classesPreset when sent. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(PRESET_CLASS_NAMES.length)
  @IsIn(PRESET_CLASS_NAMES, { each: true })
  classNames?: string[];

  /** Partial pick from the STANDARD subjects; overrides subjectsPreset when sent. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(PRESET_SUBJECT_NAMES.length)
  @IsIn(PRESET_SUBJECT_NAMES, { each: true })
  subjectNames?: string[];

  /**
   * Per-class sections and curriculum (order = levelOrder, max 30). When sent,
   * the legacy preset fields above are ignored.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_SETUP_CLASSES)
  @ValidateNested({ each: true })
  @Type(() => SetupClassInput)
  classes?: SetupClassInput[];

  /** Default: 08:00, 8 × 40 min, 30-min break after period 4, Friday 6 × 35 min. */
  @IsOptional()
  @ValidateNested()
  @Type(() => BellPlanInput)
  bellSchedule?: BellPlanInput;
}
