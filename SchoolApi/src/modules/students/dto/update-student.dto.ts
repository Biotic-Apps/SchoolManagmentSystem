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
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';
import { ID_NUMBER_PATTERN } from './child-input.dto';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  lastName?: string;

  @IsOptionalDateOnly()
  dob?: string;

  @IsOptional()
  @IsIn(Object.values(Gender))
  gender?: Gender;

  @IsOptional()
  @Matches(ID_NUMBER_PATTERN, { message: 'bForm must be 13 digits' })
  bForm?: string;

  @IsOptional()
  @IsUUID()
  photoFileId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;
}
