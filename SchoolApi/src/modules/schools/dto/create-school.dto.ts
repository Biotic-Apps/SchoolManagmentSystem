import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PHONE_PATTERN } from '../../me/dto/update-me.dto';

export class CreateSchoolDto {
  /** 2–12 uppercase letters/digits. */
  @Matches(/^[A-Z0-9]{2,12}$/, {
    message: 'code must be 2-12 uppercase letters or digits',
  })
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @Matches(PHONE_PATTERN, { message: 'phone must be a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(200)
  website?: string;

  @IsOptional()
  @IsUUID()
  logoFileId?: string;
}
