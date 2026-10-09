import { IsOptional, IsUUID, Matches } from 'class-validator';

export class PrintChallansDto {
  @IsUUID()
  branchId!: string;

  /** Billing month `YYYY-MM`. */
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'period must be YYYY-MM' })
  period!: string;

  /** Omitted: every class of the branch. */
  @IsOptional()
  @IsUUID()
  classId?: string;

  /** Omitted: every section (of the class). */
  @IsOptional()
  @IsUUID()
  sectionId?: string;
}

export class PrintChallansJobDto {
  jobId!: string;
  /** Challans (pages) the PDF will hold. */
  count!: number;
}
