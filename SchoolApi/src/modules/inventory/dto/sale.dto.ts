import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { MovementDto } from './stock.dto';

export class SaleLineInputDto {
  @IsUUID()
  itemId!: string;

  @IsInt()
  @Min(1)
  @Max(10_000)
  quantity!: number;
}

export class CreateSaleDto {
  @IsUUID()
  studentId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => SaleLineInputDto)
  lines!: SaleLineInputDto[];
}

export class SaleDto {
  invoiceId!: string;
  invoiceNo!: string;
  totalMinor!: number;
  movements!: MovementDto[];
}
