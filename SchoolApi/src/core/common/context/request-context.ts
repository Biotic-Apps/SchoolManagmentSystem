import { AsyncLocalStorage } from 'node:async_hooks';
import type { AuditEntry } from '../../audit/audit-entry';

export interface RequestContext {
  ip?: string;
  userAgent?: string;
  actorId?: string;
  auditEntries: AuditEntry[];
}

export const requestContext = new AsyncLocalStorage<RequestContext>();
