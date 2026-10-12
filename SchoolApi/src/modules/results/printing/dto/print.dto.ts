import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { EXAM_PRINT_KINDS, type ExamPrintKind } from '../print-job';

export class ExamPrintDto {
  @ApiProperty({
    enum: EXAM_PRINT_KINDS,
    description:
      'REPORT_CARDS: one card per student (computed results). DATE_SHEET: papers per class. AWARD_LIST: blank marks sheet per section.',
  })
  @IsIn(EXAM_PRINT_KINDS)
  kind!: ExamPrintKind;

  /** One section (report cards, award list). */
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  /** One class: every section of it you can reach (or its date sheet). */
  @IsOptional()
  @IsUUID()
  classId?: string;

  /** AWARD_LIST only: a single paper with marks / in words / remarks columns. */
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  /** REPORT_CARDS only: override the default template. */
  @IsOptional()
  @IsUUID()
  templateId?: string;
}
