import type { Request } from 'express';

export function clientIp(request: Request): string | undefined {
  return request.ip;
}

export function userAgent(request: Request): string | undefined {
  return request.headers['user-agent']?.slice(0, 255);
}
