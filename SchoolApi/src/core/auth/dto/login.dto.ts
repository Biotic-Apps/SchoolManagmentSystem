import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ClientPlatform } from '../../../generated/prisma/client';

export class LoginDto {
  /** Email or phone number. */
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  identifier!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;

  @IsIn(Object.values(ClientPlatform))
  platform!: ClientPlatform;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceName?: string;
}
