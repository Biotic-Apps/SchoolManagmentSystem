import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ItemCategory } from '../../../generated/prisma/client';
import { ListQueryDto } from '../../../core/common/pagination/list-query.dto';

export class CreateItemDto {
  @ApiPropertyOptional({ description: 'Defaults to the caller’s school' })
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @Matches(/^[A-Za-z0-9][A-Za-z0-9_.-]{0,39}$/, {
    message: 'sku must be 1–40 letters, digits, dot, dash or underscore',
  })
  sku!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @ApiProperty({ enum: ItemCategory })
  @IsIn(Object.values(ItemCategory))
  category!: ItemCategory;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  unit!: string;

  @IsInt()
  @Min(0)
  @Max(1_000_000)
  reorderLevel!: number;

  @IsBoolean()
  isAsset!: boolean;

  @IsBoolean()
  saleable!: boolean;

  @ApiPropertyOptional({ description: 'Required when saleable' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  salePriceMinor?: number;
}

export class ItemQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @ApiPropertyOptional({ description: 'Adds stock for this branch' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ enum: ItemCategory })
  @IsOptional()
  @IsIn(Object.values(ItemCategory))
  category?: ItemCategory;

  @ApiPropertyOptional({
    description: 'Only items at/below reorder level (needs branchId)',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  lowStock?: boolean;
}

export class ItemDto {
  id!: string;
  schoolId!: string;
  sku!: string;
  name!: string;
  @ApiProperty({ enum: ItemCategory })
  category!: ItemCategory;
  unit!: string;
  reorderLevel!: number;
  isAsset!: boolean;
  saleable!: boolean;
  salePriceMinor!: number | null;
  status!: string;
  /** Stock in `branchId` (null without a branch). */
  stock!: number | null;
  lowStock!: boolean | null;
  createdAt!: string;
}

export class ItemRefDto {
  id!: string;
  sku!: string;
  name!: string;
  unit!: string;
  @ApiProperty({ enum: ItemCategory })
  category!: ItemCategory;
}
