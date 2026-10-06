import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppConfigService } from '../config/app-config.service';

/**
 * Express `trust proxy` value: an explicit TRUSTED_PROXIES list wins; unset
 * trusts loopback (local BFF / dev proxy) outside production and nobody in
 * production. `req.ip` is then the right-most untrusted X-Forwarded-For
 * entry, which feeds the throttler tracker, audit rows and session IPs.
 */
export function trustProxySetting(
  trusted: string[] | undefined,
  isProduction: boolean,
): string[] | string | false {
  if (trusted && trusted.length > 0) return trusted;
  return isProduction ? false : 'loopback';
}

export function applyTrustProxy(app: INestApplication): void {
  const config = app.get(AppConfigService);
  (app as NestExpressApplication).set(
    'trust proxy',
    trustProxySetting(config.get('TRUSTED_PROXIES'), config.isProduction),
  );
}
