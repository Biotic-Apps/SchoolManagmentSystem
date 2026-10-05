export class AuthTokensDto {
  accessToken!: string;
  refreshToken!: string;
  /** Seconds until the access token expires. */
  accessExpiresIn!: number;
  mustChangePassword!: boolean;
}
