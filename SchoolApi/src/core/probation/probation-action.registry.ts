import { Injectable } from '@nestjs/common';
import type { ProbationActionHandler } from './probation-action';

@Injectable()
export class ProbationActionRegistry {
  private readonly handlers = new Map<string, ProbationActionHandler<any>>();

  register(handler: ProbationActionHandler<any>): void {
    if (this.handlers.has(handler.key))
      throw new Error(`Probation action ${handler.key} already registered`);
    this.handlers.set(handler.key, handler);
  }

  get(key: string): ProbationActionHandler {
    const handler = this.handlers.get(key);
    if (!handler) throw new Error(`No probation action handler for ${key}`);
    return handler;
  }
}
