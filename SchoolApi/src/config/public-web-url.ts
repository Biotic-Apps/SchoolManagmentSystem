import type { AppConfigService } from './app-config.service';

/**
 * The school web app's address: PUBLIC_WEB_URL, else (unless `strict`) the
 * first CORS origin.
 */
export function publicWebUrl(
  config: AppConfigService,
  strict = false,
): string | null {
  const configured = config.get('PUBLIC_WEB_URL');
  const url = configured ?? (strict ? null : config.get('CORS_ORIGINS')[0]);
  return url ? url.replace(/\/+$/, '') : null;
}

/** The sign-in page, when the web address is known. */
export function loginPageUrl(
  config: AppConfigService,
  strict = false,
): string | null {
  const base = publicWebUrl(config, strict);
  return base ? `${base}/login` : null;
}
