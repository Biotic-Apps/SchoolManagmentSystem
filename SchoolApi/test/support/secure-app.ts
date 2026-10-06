import '../../src/bootstrap/load-fallback-env';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { applyHttpSecurity } from '../../src/bootstrap/apply-http-security';
import { configureApp } from '../../src/bootstrap/configure-app';
import { AppConfigService } from '../../src/config/app-config.service';

/** Same wiring as main.ts (helmet + CORS + configureApp), for header tests. */
export async function createSecureTestApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>();
  applyHttpSecurity(app, app.get(AppConfigService).get('CORS_ORIGINS'));
  configureApp(app);
  await app.init();
  return app;
}
