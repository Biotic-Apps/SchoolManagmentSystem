import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateExpenseCategoryDto {
  @ApiPropertyOptional({ description: 'Defaults to the caller’s school' })
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    description: 'Upper snake case; derived from the name when omitted',
  })
  @IsOptional()
  @Matches(/^[A-Z][A-Z0-9_]{1,29}$/, {
    message: 'code must be UPPER_SNAKE_CASE (2–30 chars)',
  })
  code?: string;
}

export class ExpenseCategoryQueryDto {
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class ExpenseCategoryDto {
  id!: string;
  schoolId!: string;
  code!: string;
  name!: string;
  status!: string;
}
