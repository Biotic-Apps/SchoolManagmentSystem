import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  FinanceRequestStatus,
  PaymentMethod,
} from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';
import { PaginationQueryDto } from '../../../../core/common/pagination/pagination-query.dto';

export class CreateRefundDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  paymentId!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  amountMinor!: number;

  @ApiProperty({ minLength: 3, maxLength: 500 })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}

export class RefundQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ enum: FinanceRequestStatus })
  @IsOptional()
  @IsEnum(FinanceRequestStatus)
  status?: FinanceRequestStatus;
}

export class RefundDto {
  id!: string;
  paymentId!: string;
  receiptNo!: string;
  student!: { id: string; name: string; admissionNo: string };
  amountMinor!: number;
  method!: string;
  reason!: string;
  @ApiProperty({ enum: FinanceRequestStatus })
  status!: string;
  approvalId!: string | null;
  requestedBy!: IdNameDto;
  decidedAt!: string | null;
  currency!: string;
  createdAt!: string;
}
