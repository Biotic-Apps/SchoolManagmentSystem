import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';
import { PageResult, type PageMeta } from '../pagination/page-result';

export interface Envelope<T> {
  data: T;
  meta?: PageMeta;
}

function wrap(value: unknown): unknown {
  if (value instanceof StreamableFile) return value;
  if (value instanceof PageResult) {
    return { data: value.data, meta: value.meta };
  }
  const envelope: Envelope<unknown> = { data: value ?? null };
  return envelope;
}

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    return next.handle().pipe(map(wrap));
  }
}
