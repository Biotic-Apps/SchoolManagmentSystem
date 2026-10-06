import {
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/** TOTP (6 digits) or a recovery code (`xxxxx-xxxxx`, case/dashes ignored). */
const CODE_PATTERN = /^[A-Za-z0-9\s-]{6,20}$/;

export class TwoFactorCodeDto {
  @IsString()
  @Matches(CODE_PATTERN, { message: 'code is not a valid code' })
  code!: string;
}

/** Enabling needs a TOTP from the authenticator app (not a recovery code). */
export class EnableTwoFactorDto {
  @IsString()
  @Matches(/^\s*\d{3}\s?\d{3}\s*$/, { message: 'code must be 6 digits' })
  code!: string;
}

export class DisableTwoFactorDto extends TwoFactorCodeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}

export class VerifyTwoFactorDto extends TwoFactorCodeDto {
  @IsUUID()
  challengeId!: string;
}

export class TwoFactorSetupDto {
  /** For the QR code. */
  otpauthUrl!: string;
  /** Base32, for manual entry. */
  secret!: string;
}

export class RecoveryCodesDto {
  /** Shown once; each code works a single time. */
  recoveryCodes!: string[];
}

export class TwoFactorStatusDto {
  enabled!: boolean;
  /** A role of the user is in the school's twoFactorRequiredFor. */
  required!: boolean;
}
