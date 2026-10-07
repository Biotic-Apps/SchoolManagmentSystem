import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';
import { MAX_SECTIONS_PER_CLASS, PRESET_NAMES } from '../presets';

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
}
