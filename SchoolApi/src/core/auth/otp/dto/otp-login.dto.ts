import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ClientPlatform } from '../../../../generated/prisma/client';

export class RequestOtpDto {
  /** Parent's mobile number, any common format (`0300-1112233`, `+92…`). */
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  phone!: string;
}

export class VerifyOtpDto {
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  phone!: string;

  /** The 6-digit code from the SMS (spaces ignored). */
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
  /** Seconds before another code can be requested for this phone. */
  resendAfterSeconds!: number;
}
