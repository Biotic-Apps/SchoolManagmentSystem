import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { StockMovementType } from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';
import { ItemRefDto } from './item.dto';

export class StockQueryDto {
  @IsUUID()
  branchId!: string;
}

export class StockRowDto {
  item!: ItemRefDto;
  quantity!: number;
  reorderLevel!: number;
  lowStock!: boolean;
}

export class CreateMovementDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  itemId!: string;

  @ApiProperty({ enum: StockMovementType })
  @IsIn(Object.values(StockMovementType))
  type!: StockMovementType;

  @ApiProperty({
    description: 'Positive count; ADJUST may be negative (non-zero)',
  })
  @IsInt()
  @Min(-1_000_000)
  @Max(1_000_000)
  quantity!: number;

  @ApiPropertyOptional({ description: 'Required for TRANSFER_OUT' })
  @IsOptional()
  @IsUUID()
  toBranchId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  issuedTo?: string;

  @ApiPropertyOptional({ description: 'ISSUE to / IN (return) from a student' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Required for ADJUST' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class MovementQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  itemId?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptionalDateOnly()
  from?: string;

  @IsOptionalDateOnly()
  to?: string;
}

export class MovementDto {
  id!: string;
  branchId!: string;
  item!: ItemRefDto;
  @ApiProperty({ enum: StockMovementType })
  type!: StockMovementType;
  /** Signed: + adds stock, − removes it. */
  quantity!: number;
  issuedTo!: string | null;
  studentId!: string | null;
  reason!: string | null;
  refType!: string | null;
  refId!: string | null;
  performedBy!: IdNameDto | null;
  /** Stock in the branch right after this movement (create responses only). */
  balanceAfter?: number;
  createdAt!: string;
}
