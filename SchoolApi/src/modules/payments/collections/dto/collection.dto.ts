import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../../core/common/validation/is-date-only';
import { PaymentDto } from '../../payments/dto/payment.dto';

export class DailyCollectionQueryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  branchId!: string;

  /** Default: today (school time zone). */
  @IsOptionalDateOnly()
  date?: string;
}

export class CloseDayDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  branchId!: string;

  @IsDateOnly()
  date!: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  cashCountedMinor!: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class MethodTotalDto {
  method!: string;
  count!: number;
  amountMinor!: number;
}

export class CashierTotalDto {
  cashier!: IdNameDto;
  count!: number;
  amountMinor!: number;
}

export class DayClosingDto {
  closedBy!: IdNameDto;
  closedAt!: string;
  cashExpectedMinor!: number;
  cashCountedMinor!: number;
  differenceMinor!: number;
  note!: string | null;
}

export class DailyCollectionDto {
  branchId!: string;
  date!: string;
  count!: number;
  totalMinor!: number;
  cashMinor!: number;
  @ApiProperty({ type: [MethodTotalDto] })
  byMethod!: MethodTotalDto[];
  @ApiProperty({ type: [CashierTotalDto] })
  byCashier!: CashierTotalDto[];
  @ApiProperty({ type: [PaymentDto] })
  payments!: PaymentDto[];
  reversedCount!: number;
  reversedMinor!: number;
  @ApiProperty({ type: [PaymentDto] })
  reversedPayments!: PaymentDto[];
  closed!: DayClosingDto | null;
  currency!: string;
}
