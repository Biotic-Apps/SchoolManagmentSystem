import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

export function applyHttpSecurity(
  app: INestApplication,
  corsOrigins: string[],
): void {
  app.use(helmet());
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });
}
