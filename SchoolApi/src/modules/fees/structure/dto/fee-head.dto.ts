import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { FeeHeadKind } from '../../../../generated/prisma/client';

export class FeeHeadQueryDto {
  /** Defaults to the caller's school when they belong to exactly one. */
  @IsOptional()
  @IsUUID()
  schoolId?: string;
}

export class CreateFeeHeadDto {
  @IsUUID()
  schoolId!: string;

  /** Upper-case letters, digits, `_` or `-`; unique per school. */
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{2,30}$/, {
    message: 'code must be 2–30 letters, digits, _ or -',
  })
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsIn(Object.values(FeeHeadKind))
  kind!: FeeHeadKind;

  @IsBoolean()
  refundable!: boolean;
}

export class FeeHeadDto {
  id!: string;
  schoolId!: string;
  code!: string;
  name!: string;
  kind!: FeeHeadKind;
  refundable!: boolean;
  /** System heads (ACTIVITY, STORE) are billed automatically, never in plans. */
  system!: boolean;
  status!: string;
}
