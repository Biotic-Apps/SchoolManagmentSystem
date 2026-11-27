import type { INestApplication } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

/** Signed file content (`GET /api/v1/files/:id/content?exp=&sig=`). */
const FILE_CONTENT_PATH = /\/files\/[^/]+\/content\/?$/;

/**
 * Cross-Origin-Resource-Policy per route. The web app (e.g.
 * futurelearning.duckdns.org) and the API (api.futurelearning.duckdns.org)
 * are different origins, and not even the same site (duckdns.org is a public
 * suffix), so `<img src>` of an uploaded logo/photo/attachment is blocked
 * under helmet's default `same-origin`. Signed file content is meant to be
 * embedded by the web origin (the signature is the access check), so it is
 * `cross-origin`; every other response keeps `same-origin`.
 */
export function corpFor(path: string): 'cross-origin' | 'same-origin' {
  return FILE_CONTENT_PATH.test(path) ? 'cross-origin' : 'same-origin';
}

export function applyHttpSecurity(
  app: INestApplication,
  corsOrigins: string[],
): void {
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cross-Origin-Resource-Policy', corpFor(req.path));
    next();
  });
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });
}
