import { BullModule } from '@nestjs/bullmq';
import type { DynamicModule } from '@nestjs/common';
import type { QueueName } from './queues';

export function registerQueues(...names: QueueName[]): DynamicModule {
  return BullModule.registerQueue(...names.map((name) => ({ name })));
}
