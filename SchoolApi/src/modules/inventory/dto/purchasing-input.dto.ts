import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  PurchaseOrderStatus,
  PurchaseRequestStatus,
} from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../core/common/validation/is-date-only';

const MAX_QTY = 1_000_000;

export class RequestLineInputDto {
  @IsUUID()
  itemId!: string;

  @IsInt()
  @Min(1)
  @Max(MAX_QTY)
  quantity!: number;

  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  estimatedUnitMinor!: number;
}

export class CreatePurchaseRequestDto {
  @IsUUID()
  branchId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => RequestLineInputDto)
  lines!: RequestLineInputDto[];

  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason!: string;
}

export class OrderLineInputDto {
  @IsUUID()
  itemId!: string;

  @IsInt()
  @Min(1)
  @Max(MAX_QTY)
  quantity!: number;

  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  unitPriceMinor!: number;
}

export class CreateOrderDto {
  @IsUUID()
  vendorId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => OrderLineInputDto)
  lines!: OrderLineInputDto[];

  @IsOptionalDateOnly()
  expectedOn?: string;
}

export class ReceiveLineInputDto {
  @IsUUID()
  itemId!: string;

  @IsInt()
  @Min(0)
  @Max(MAX_QTY)
  quantity!: number;
}

export class ReceiveOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ReceiveLineInputDto)
  lines!: ReceiveLineInputDto[];

  @IsDateOnly()
  receivedOn!: string;
}

export class PurchaseRequestQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ enum: PurchaseRequestStatus })
  @IsOptional()
  @IsIn(Object.values(PurchaseRequestStatus))
  status?: PurchaseRequestStatus;
}

export class PurchaseOrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ enum: PurchaseOrderStatus })
  @IsOptional()
  @IsIn(Object.values(PurchaseOrderStatus))
  status?: PurchaseOrderStatus;

  @IsOptional()
  @IsUUID()
  vendorId?: string;
}
