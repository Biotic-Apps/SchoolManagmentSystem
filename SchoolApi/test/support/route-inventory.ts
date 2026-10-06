import { RequestMethod, type INestApplication } from '@nestjs/common';
import {
  METHOD_METADATA,
  PATH_METADATA,
  ROUTE_ARGS_METADATA,
} from '@nestjs/common/constants';
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum';
import { ModulesContainer } from '@nestjs/core';
import { getMetadataStorage } from 'class-validator';
import { AUTH_THROTTLE_KEY } from '../../src/core/throttling/auth-throttle.decorator';
import { IS_PUBLIC_KEY } from '../../src/core/common/decorators/public.decorator';
import { REQUIRED_PERMISSIONS_KEY } from '../../src/core/rbac/require-permission.decorator';

export interface RouteInfo {
  /** `GET /students/:id` (no global prefix). */
  key: string;
  method: string;
  path: string;
  isPublic: boolean;
  /** Carries @AuthThrottle (strict per-IP auth limit). */
  authThrottle: boolean;
  permissions: string[];
  /** Properties of the `@Query()` DTO (class-validator metadata). */
  queryFields: string[];
  handler: string;
}

const join = (...parts: string[]) =>
  '/' +
  parts
    .flatMap((part) => part.split('/'))
    .filter((part) => part.length > 0)
    .join('/');

const paths = (value: unknown): string[] =>
  Array.isArray(value) ? (value as string[]) : [(value as string) ?? '/'];

interface RouteArg {
  index: number;
  data?: unknown;
}

/** Field names of the whole-object `@Query()` DTO of a handler. */
function queryFields(type: object, name: string): string[] {
  const args = (Reflect.getMetadata(ROUTE_ARGS_METADATA, type, name) ??
    {}) as Record<string, RouteArg>;
  const types = (Reflect.getMetadata(
    'design:paramtypes',
    (type as { prototype: object }).prototype,
    name,
  ) ?? []) as (new () => unknown)[];
  const fields = new Set<string>();
  for (const [key, arg] of Object.entries(args)) {
    if (key.split(':')[0] !== String(RouteParamtypes.QUERY)) continue;
    if (typeof arg.data === 'string') {
      fields.add(arg.data);
      continue;
    }
    const dto = types[arg.index];
    if (!dto) continue;
    for (const meta of getMetadataStorage().getTargetValidationMetadatas(
      dto,
      '',
      true,
      false,
    )) {
      fields.add(meta.propertyName);
    }
  }
  return [...fields].sort();
}

/** Every HTTP route registered by a controller, read from Nest metadata. */
export function listRoutes(app: INestApplication): RouteInfo[] {
  const modules = app.get(ModulesContainer);
  const wrappers = [...modules.values()].flatMap((m) => [
    ...m.controllers.values(),
  ]);
  const routes: RouteInfo[] = [];
  for (const wrapper of wrappers) {
    const type = wrapper.metatype as (new () => unknown) | undefined;
    if (!type) continue;
    const proto = type.prototype as Record<string, unknown>;
    for (const name of Object.getOwnPropertyNames(proto)) {
      const fn = proto[name];
      if (name === 'constructor' || typeof fn !== 'function') continue;
      const method = Reflect.getMetadata(METHOD_METADATA, fn) as
        RequestMethod | undefined;
      if (method === undefined) continue;
      const read = <T>(key: string): T | undefined =>
        (Reflect.getMetadata(key, fn) ?? Reflect.getMetadata(key, type)) as
          T | undefined;
      for (const base of paths(Reflect.getMetadata(PATH_METADATA, type))) {
        for (const sub of paths(Reflect.getMetadata(PATH_METADATA, fn))) {
          const path = join(base, sub);
          const verb = RequestMethod[method];
          routes.push({
            key: `${verb} ${path}`,
            method: verb,
            path,
            isPublic: read<boolean>(IS_PUBLIC_KEY) === true,
            authThrottle: read<boolean>(AUTH_THROTTLE_KEY) === true,
            permissions: read<string[]>(REQUIRED_PERMISSIONS_KEY) ?? [],
            queryFields: queryFields(type, name),
            handler: `${type.name}.${name}`,
          });
        }
      }
    }
  }
  return routes.sort((a, b) => a.key.localeCompare(b.key));
}
