import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApprovalStatus, ApprovalType } from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';

export class ApprovalQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(Object.values(ApprovalStatus))
  status?: ApprovalStatus;

  @IsOptional()
  @IsIn(Object.values(ApprovalType))
  type?: ApprovalType;

  /** Kind of record the request is about, e.g. `HEALTH`. */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  entityType?: string;

  /** Matches the request title. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
