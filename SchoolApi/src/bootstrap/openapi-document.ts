import type { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from '@nestjs/swagger';
import { APP_VERSION } from '../config/app-version';

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('eSchool API')
    .setDescription('eSchool Management System API')
    .setVersion(APP_VERSION)
    .addBearerAuth()
    .build();
  return SwaggerModule.createDocument(app, config);
}
