import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export const RECEIPT_FORMATS = ['a4', 'thermal'] as const;
export type ReceiptFormat = (typeof RECEIPT_FORMATS)[number];

export class ReceiptQueryDto {
  /** `a4` (default): school + student copies; `thermal`: 80 mm roll. */
  @ApiPropertyOptional({ enum: RECEIPT_FORMATS, default: 'a4' })
  @IsOptional()
  @IsIn(RECEIPT_FORMATS)
  format?: ReceiptFormat;
}
