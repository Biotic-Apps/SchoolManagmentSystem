import { IsIn, IsOptional } from 'class-validator';
import { ApprovalStatus, ApprovalType } from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';

export class ApprovalQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(Object.values(ApprovalStatus))
  status?: ApprovalStatus;

  @IsOptional()
  @IsIn(Object.values(ApprovalType))
  type?: ApprovalType;
}
