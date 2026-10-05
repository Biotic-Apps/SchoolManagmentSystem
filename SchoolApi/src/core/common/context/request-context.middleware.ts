import type { NextFunction, Request, Response } from 'express';
import { requestContext } from './request-context';

export function requestContextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const userAgent = req.headers['user-agent'];
  requestContext.run(
    { ip: req.ip, userAgent: userAgent?.slice(0, 255), auditEntries: [] },
    next,
  );
}
