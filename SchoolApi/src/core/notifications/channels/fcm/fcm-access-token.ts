import { createSign } from 'node:crypto';
import type { FcmCredentials } from './fcm-credentials';

const SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

const b64url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

/** OAuth2 service-account flow (RS256 JWT assertion), cached until expiry. */
export class FcmAccessToken {
  private cached: { token: string; expiresAt: number } | null = null;

  constructor(private readonly credentials: FcmCredentials) {}

  async get(): Promise<string> {
    if (this.cached && this.cached.expiresAt > Date.now() + 60_000) {
      return this.cached.token;
    }
    const now = Math.floor(Date.now() / 1000);
    const unsigned = `${b64url({ alg: 'RS256', typ: 'JWT' })}.${b64url({
      iss: this.credentials.clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })}`;
    const signature = createSign('RSA-SHA256')
      .update(unsigned)
      .sign(this.credentials.privateKey, 'base64url');
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${unsigned}.${signature}`,
      }),
    });
    if (!response.ok) throw new Error(`FCM auth failed (${response.status})`);
    const body = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.cached = {
      token: body.access_token,
      expiresAt: Date.now() + body.expires_in * 1000,
    };
    return body.access_token;
  }
}
