import { IsOptional, IsString, IsUUID } from 'class-validator';

export class StaffIdCardPrintDto {
  @IsUUID()
  branchId!: string;

  @IsOptional()
  @IsString()
  designation?: string;
}

export class StaffIdCardPrintJobDto {
  /** Poll `GET /jobs/:jobId`; `result.fileUrl` is the A4 sheet PDF. */
  jobId!: string;
  /** Staff on the sheet. */
  count!: number;
}
