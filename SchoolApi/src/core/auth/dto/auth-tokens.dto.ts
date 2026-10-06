export class AuthTokensDto {
  accessToken!: string;
  refreshToken!: string;
  /** Seconds until the access token expires. */
  accessExpiresIn!: number;
  mustChangePassword!: boolean;
}

/** Login answer when the account has 2FA on: call POST /auth/2fa/verify. */
export class TwoFactorChallengeDto {
  twoFactorRequired!: true;
  /** Valid for 5 minutes and 5 attempts. */
  challengeId!: string;
}

export type LoginResultDto = AuthTokensDto | TwoFactorChallengeDto;
