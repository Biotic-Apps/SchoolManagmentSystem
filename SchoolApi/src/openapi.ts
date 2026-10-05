import './bootstrap/load-fallback-env';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap/configure-app';
import { createOpenApiDocument } from './bootstrap/openapi-document';

async function exportOpenApi(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  configureApp(app);

  const target = resolve(process.argv[2] ?? 'openapi.json');
  writeFileSync(target, JSON.stringify(createOpenApiDocument(app), null, 2));
  await app.close();
  console.log(`OpenAPI written to ${target}`);
}

void exportOpenApi();
