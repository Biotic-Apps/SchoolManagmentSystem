import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';
import { IsDateOnly } from '../../../../core/common/validation/is-date-only';

export const COUNTER_METHODS = ['CASH', 'BANK', 'CHEQUE', 'ONLINE'] as const;
export type CounterMethod = (typeof COUNTER_METHODS)[number];

export class AllocationInputDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  invoiceId!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  amountMinor!: number;
}

export class CreatePaymentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  amountMinor!: number;

  @ApiProperty({ enum: COUNTER_METHODS })
  @IsIn(COUNTER_METHODS)
  method!: CounterMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @IsDateOnly()
  receivedOn!: string;

  @ApiPropertyOptional({ type: [AllocationInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => AllocationInputDto)
  allocations?: AllocationInputDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  clientRequestId?: string;
}

export class PaymentStudentDto {
  id!: string;
  name!: string;
  admissionNo!: string;
}

export class PaymentAllocationDto {
  invoiceId!: string;
  invoiceNo!: string;
  amountMinor!: number;
  /** Released by a reversal. */
  reversed!: boolean;
}

export class PaymentDto {
  id!: string;
  receiptNo!: string;
  student!: PaymentStudentDto;
  amountMinor!: number;
  /** Advance credit still on this payment. */
  unallocatedMinor!: number;
  method!: string;
  reference!: string | null;
  receivedOn!: string;
  receivedBy!: IdNameDto;
  @ApiProperty({ enum: ['RECORDED', 'REVERSAL_PENDING', 'REVERSED'] })
  status!: string;
  reversalReason!: string | null;
  reversedAt!: string | null;
  gateway!: string | null;
  proofId!: string | null;
  @ApiProperty({ type: [PaymentAllocationDto] })
  allocations!: PaymentAllocationDto[];
  currency!: string;
  createdAt!: string;
}

export class ReceiptJobDto {
  jobId!: string;
  @ApiProperty({ enum: ['PENDING', 'READY', 'FAILED'] })
  status!: string;
  fileUrl!: string | null;
}
