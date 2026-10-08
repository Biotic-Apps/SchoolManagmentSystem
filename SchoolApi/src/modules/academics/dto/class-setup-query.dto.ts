import { IsOptional, IsUUID } from 'class-validator';

export class ClassSetupQueryDto {
  /** Required when the caller reaches more than one branch. */
  @IsOptional()
  @IsUUID()
  branchId?: string;

  /** Defaults to the branch's ACTIVE session. */
  @IsOptional()
  @IsUUID()
  sessionId?: string;
}
