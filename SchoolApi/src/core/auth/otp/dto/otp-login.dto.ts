import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ClientPlatform } from '../../../../generated/prisma/client';

export class RequestOtpDto {
  /** Parent's email address (case-insensitive). */
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  email!: string;
}

export class VerifyOtpDto {
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  email!: string;

  /** The 6-digit code from the email (spaces ignored). */
  @IsString()
  @MinLength(1)
  @MaxLength(12)
  code!: string;

  @IsIn(Object.values(ClientPlatform))
  platform!: ClientPlatform;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceName?: string;
}

export class OtpRequestResultDto {
  ok!: true;
  /** Seconds before another code can be requested for this email. */
  resendAfterSeconds!: number;
  /** Local development only (OTP_DEV_ECHO=true with EMAIL_DRIVER=log); never in production. */
  devCode?: string;
}
