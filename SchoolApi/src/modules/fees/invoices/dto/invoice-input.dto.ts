import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
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
  ValidateNested,
} from 'class-validator';
import { InvoiceStatus } from '../../../../generated/prisma/client';
import { ListQueryDto } from '../../../../core/common/pagination/list-query.dto';
import { IsDateOnly } from '../../../../core/common/validation/is-date-only';

const PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/;

export class GenerateInvoicesDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  sessionId!: string;

  @Matches(PERIOD, { message: 'period must be YYYY-MM' })
  period!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  classIds?: string[];
}

export class InvoiceQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @Matches(PERIOD, { message: 'period must be YYYY-MM' })
  period?: string;

  @IsOptional()
  @IsIn(Object.values(InvoiceStatus))
  declare status?: InvoiceStatus;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;
}

export class IssueInvoicesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  invoiceIds!: string[];
}

export class AdhocLineInputDto {
  @IsUUID()
  feeHeadId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  description!: string;

  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  amountMinor!: number;
}

export class CreateAdhocInvoiceDto {
  @IsUUID()
  studentId!: string;

  @IsDateOnly()
  dueDate!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => AdhocLineInputDto)
  lines!: AdhocLineInputDto[];
}

export class CancelInvoiceDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
