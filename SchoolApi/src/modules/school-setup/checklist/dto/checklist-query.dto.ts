import { IsOptional, IsUUID } from 'class-validator';

export class ChecklistQueryDto {
  /** Required for Super Admin; a principal defaults to their own branch. */
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
