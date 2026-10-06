import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AssetCondition } from '../../../generated/prisma/client';
import { ListQueryDto } from '../../../core/common/pagination/list-query.dto';
import { ItemRefDto } from './item.dto';

export class CreateAssetDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  itemId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  tag!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(150)
  location!: string;

  @ApiProperty({ enum: AssetCondition })
  @IsIn(Object.values(AssetCondition))
  condition!: AssetCondition;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  assignedTo?: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  location?: string;

  @ApiPropertyOptional({ enum: AssetCondition })
  @IsOptional()
  @IsIn(Object.values(AssetCondition))
  condition?: AssetCondition;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Empty string clears it',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  assignedTo?: string;
}

export class AssetQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  itemId?: string;

  @ApiPropertyOptional({ enum: AssetCondition })
  @IsOptional()
  @IsIn(Object.values(AssetCondition))
  condition?: AssetCondition;
}

export class AssetDto {
  id!: string;
  branchId!: string;
  item!: ItemRefDto;
  tag!: string;
  location!: string;
  @ApiProperty({ enum: AssetCondition })
  condition!: AssetCondition;
  assignedTo!: string | null;
  createdAt!: string;
  updatedAt!: string;
}
