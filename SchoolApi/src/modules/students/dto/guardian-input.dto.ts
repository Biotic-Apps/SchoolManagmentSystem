import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { GuardianRelation } from '../../../generated/prisma/client';
import { PHONE_PATTERN } from '../../me/dto/update-me.dto';
import { ID_NUMBER_PATTERN } from './child-input.dto';

export class GuardianInputDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsIn(Object.values(GuardianRelation))
  relation!: GuardianRelation;

  @IsOptional()
  @Matches(ID_NUMBER_PATTERN, { message: 'cnic must be 13 digits' })
  cnic?: string;

  @Matches(PHONE_PATTERN, { message: 'phone must be a valid phone number' })
  phone!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;
}

export class PrimaryGuardianInputDto extends GuardianInputDto {
  @IsBoolean()
  isPrimary!: boolean;
}
