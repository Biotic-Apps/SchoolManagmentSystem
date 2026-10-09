import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class IdCardPrintDto {
  /** One section; otherwise `branchId` (+ optional `classId`). */
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ValidateIf((o: IdCardPrintDto) => !o.sectionId)
  @IsUUID()
  branchId?: string;

  /** With `branchId`: every current section of this class. */
  @IsOptional()
  @IsUUID()
  classId?: string;
}

export class IdCardPrintJobDto {
  /** Poll `GET /jobs/:jobId`; `result.fileUrl` is the A4 sheet PDF. */
  jobId!: string;
  /** Students on the sheet. */
  count!: number;
}
