import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { applyHttpSecurity } from './bootstrap/apply-http-security';
import { configureApp } from './bootstrap/configure-app';
import { createOpenApiDocument } from './bootstrap/openapi-document';
import { AppConfigService } from './config/app-config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  applyHttpSecurity(app, config.get('CORS_ORIGINS'));
  configureApp(app);
  app.enableShutdownHooks();

  if (!config.isProduction) {
    SwaggerModule.setup('docs', app, createOpenApiDocument(app));
  }

  await app.listen(config.get('PORT'), '0.0.0.0');
}

bootstrap().catch((err) => {
  console.error('FATAL: bootstrap failed', err);
  process.exit(1);
});
