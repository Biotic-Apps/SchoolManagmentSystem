import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from '../../../generated/prisma/client';
import { IsDateOnly } from '../../../core/common/validation/is-date-only';

/** 13-digit Pakistani B-Form / CNIC, dashes optional. */
export const ID_NUMBER_PATTERN = /^\d{5}-?\d{7}-?\d$/;

export class ChildInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName!: string;

  @IsString()
  @MaxLength(60)
  lastName!: string;

  @IsDateOnly()
  dob!: string;

  @IsIn(Object.values(Gender))
  gender!: Gender;

  @IsOptional()
  @Matches(ID_NUMBER_PATTERN, { message: 'bForm must be 13 digits' })
  bForm?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  previousSchool?: string;

  @IsOptional()
  @IsUUID()
  photoFileId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;
}
