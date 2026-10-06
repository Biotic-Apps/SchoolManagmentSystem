import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { requestContextMiddleware } from '../core/common/context/request-context.middleware';
import { applyTrustProxy } from './trust-proxy';

export const API_PREFIX = 'api/v1';

/** Settings shared by the HTTP server, e2e tests and the OpenAPI export. */
export function configureApp(app: INestApplication): void {
  applyTrustProxy(app);
  app.use(requestContextMiddleware);
  app.setGlobalPrefix(API_PREFIX, { exclude: ['health'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
