import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApprovalDecision } from '../../../generated/prisma/client';

export class DecideApprovalDto {
  @IsIn(Object.values(ApprovalDecision))
  decision!: ApprovalDecision;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
