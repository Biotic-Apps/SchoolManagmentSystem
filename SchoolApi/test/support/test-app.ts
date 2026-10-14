import '../../src/bootstrap/load-fallback-env';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/bootstrap/configure-app';

export const DEMO_PASSWORD = 'Demo@1234';
export const API = '/api/v1';

export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>();
  configureApp(app);
  await app.init();
  // Fire-and-forget writes (audit reads, notifications) can still be in flight
  // when a suite ends; let them settle so nothing touches the pool after close.
  const close = app.close.bind(app);
  app.close = async () => {
    await new Promise((r) => setTimeout(r, 500));
    return close();
  };
  return app;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
}

export async function login(
  app: INestApplication<App>,
  identifier: string,
  password = DEMO_PASSWORD,
): Promise<Tokens> {
  const res = await request(app.getHttpServer())
    .post(`${API}/auth/login`)
    .send({ identifier, password, platform: 'WEB', deviceName: 'e2e' })
    .expect(200);
  return (res.body as { data: Tokens }).data;
}

/** Authenticated request helper. */
export function as(app: INestApplication<App>, token: string, role?: string) {
  const server = app.getHttpServer();
  const withAuth = (req: request.Test) => {
    req.set('Authorization', `Bearer ${token}`);
    if (role) req.set('X-Active-Role', role);
    return req;
  };
  return {
    get: (path: string) => withAuth(request(server).get(API + path)),
    post: (path: string, body: object = {}) =>
      withAuth(request(server).post(API + path)).send(body),
    patch: (path: string, body: object) =>
      withAuth(request(server).patch(API + path)).send(body),
    put: (path: string, body: object) =>
      withAuth(request(server).put(API + path)).send(body),
    delete: (path: string) => withAuth(request(server).delete(API + path)),
  };
}

export const unique = (prefix: string) =>
  `${prefix}${Date.now().toString(36).toUpperCase().slice(-6)}`;

export interface ErrorResponse {
  body: { error: { code: string } };
}

export const errorCode = (res: ErrorResponse) => res.body.error.code;
