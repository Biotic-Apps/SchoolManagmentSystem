import {
  IsOptional,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class LoginSlipPrintDto {
  /** One section; otherwise `branchId` (+ optional `classId`). */
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ValidateIf((o: LoginSlipPrintDto) => !o.sectionId)
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  /**
   * Sign-in page as the staff member sees it (web origin + /login). Used
   * only when the server has no PUBLIC_WEB_URL.
   */
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_tld: false })
  @MaxLength(200)
  loginUrl?: string;
}

export class LoginSlipPreviewDto {
  students!: number;
  /** Slips that will print (one per child, for the primary guardian). */
  slips!: number;
  /** Parents without a sign-in: one is made with a temporary password. */
  create!: number;
  /** Parents who never signed in: their temporary password is replaced. */
  reset!: number;
  /** Parents who already sign in: password unchanged, username only. */
  keep!: number;
  /** Children without a verified guardian, or with a disabled sign-in. */
  skip!: number;
  /** Address printed on the slips. */
  loginUrl!: string;
}

export class LoginSlipJobDto {
  /** Poll `GET /jobs/:jobId`; `result.fileUrl` is the slips PDF (only you can open it). */
  jobId!: string;
  count!: number;
}
