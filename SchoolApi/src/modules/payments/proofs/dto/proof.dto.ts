import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ProofStatus } from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';
import { PaginationQueryDto } from '../../../../core/common/pagination/pagination-query.dto';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../../core/common/validation/is-date-only';

export const PROOF_METHODS = ['BANK', 'WALLET', 'OTHER'] as const;
export type ProofMethod = (typeof PROOF_METHODS)[number];

export class CreateProofDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  invoiceId!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  amountMinor!: number;

  @IsDateOnly()
  paidOn!: string;

  @ApiProperty({ enum: PROOF_METHODS })
  @IsIn(PROOF_METHODS)
  method!: ProofMethod;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  reference!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fileId!: string;
}

export class VerifyProofDto {
  @IsOptionalDateOnly()
  receivedOn?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class RejectProofDto {
  @ApiProperty({ minLength: 3, maxLength: 500 })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class ProofQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ enum: ProofStatus })
  @IsOptional()
  @IsEnum(ProofStatus)
  status?: ProofStatus;
}

export class ProofDto {
  id!: string;
  invoiceId!: string;
  invoiceNo!: string;
  student!: { id: string; name: string; admissionNo: string };
  amountMinor!: number;
  paidOn!: string;
  method!: string;
  reference!: string;
  fileId!: string;
  fileUrl!: string;
  @ApiProperty({ enum: ProofStatus })
  status!: string;
  submittedBy!: IdNameDto;
  decidedBy!: IdNameDto | null;
  decidedAt!: string | null;
  note!: string | null;
  rejectReason!: string | null;
  paymentId!: string | null;
  receiptNo!: string | null;
  currency!: string;
  createdAt!: string;
}
