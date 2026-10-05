import { Injectable } from '@nestjs/common';
import type { ApprovalType } from '../../generated/prisma/client';
import type { ApprovalHandler } from './approval-handler';

@Injectable()
export class ApprovalHandlerRegistry {
  private readonly handlers = new Map<ApprovalType, ApprovalHandler>();

  register(handler: ApprovalHandler): void {
    if (this.handlers.has(handler.type)) {
      throw new Error(
        `Approval handler for ${handler.type} already registered`,
      );
    }
    this.handlers.set(handler.type, handler);
  }

  get(type: ApprovalType): ApprovalHandler {
    const handler = this.handlers.get(type);
    if (!handler) throw new Error(`No approval handler for ${type}`);
    return handler;
  }

  has(type: ApprovalType): boolean {
    return this.handlers.has(type);
  }
}
