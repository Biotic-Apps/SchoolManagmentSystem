import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { mergeMap, type Observable } from 'rxjs';
import { requestContext } from '../common/context/request-context';
import { AuditService } from './audit.service';

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Persists staged audit entries after a successful mutation. */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    const method = context.switchToHttp().getRequest<Request>().method;
    const store = requestContext.getStore();
    if (READ_METHODS.has(method) || !store) return next.handle();
    return next.handle().pipe(
      mergeMap(async (value) => {
        await this.audit.flush(store);
        return value;
      }),
    );
  }
}
