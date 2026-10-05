import { getQueueToken } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { Queue } from 'bullmq';
import { JobDispatcher } from './job-dispatcher';
import type { QueueName } from './queues';

@Injectable()
export class BullmqJobDispatcher extends JobDispatcher {
  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }

  async dispatch<T>(queue: QueueName, name: string, data: T): Promise<void> {
    const target = this.moduleRef.get<Queue>(getQueueToken(queue), {
      strict: false,
    });
    await target.add(name, data);
  }
}
