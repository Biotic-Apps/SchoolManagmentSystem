import { Injectable } from '@nestjs/common';
import type { ApprovalType } from '../../generated/prisma/client';
import type { ApprovalHandler } from './approval-handler';

const keyOf = (type: ApprovalType, entityType?: string) =>
  entityType ? `${type}:${entityType}` : type;

@Injectable()
export class ApprovalHandlerRegistry {
  private readonly handlers = new Map<string, ApprovalHandler>();

  register(handler: ApprovalHandler): void {
    const key = keyOf(handler.type, handler.entityType);
    if (this.handlers.has(key)) {
      throw new Error(`Approval handler for ${key} already registered`);
    }
    this.handlers.set(key, handler);
  }

  /** The entity-specific handler wins over the generic one of the type. */
  get(type: ApprovalType, entityType?: string): ApprovalHandler {
    const handler =
      (entityType && this.handlers.get(keyOf(type, entityType))) ||
      this.handlers.get(type);
    if (!handler) throw new Error(`No approval handler for ${type}`);
    return handler;
  }

  has(type: ApprovalType, entityType?: string): boolean {
    return (
      this.handlers.has(type) ||
      (!!entityType && this.handlers.has(keyOf(type, entityType)))
    );
  }
}
