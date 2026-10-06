import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TransferStatus } from '../../../../generated/prisma/client';
import { PaginationQueryDto } from '../../../../core/common/pagination/pagination-query.dto';
import { IsDateOnly } from '../../../../core/common/validation/is-date-only';

export class RequestTransferDto {
  @IsUUID()
  toBranchId!: string;

  @IsDateOnly()
  effectiveDate!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class AcceptTransferDto {
  @IsUUID()
  sectionId!: string;
}

export class TransferReasonDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class TransferQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsIn(['IN', 'OUT'])
  direction?: 'IN' | 'OUT';

  @IsOptional()
  @IsIn(Object.values(TransferStatus))
  status?: TransferStatus;
}
