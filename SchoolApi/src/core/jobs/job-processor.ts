import type { QueueName } from './queues';

/** One background job type. The same class runs under BullMQ and inline. */
export interface JobProcessor<T = unknown> {
  readonly queue: QueueName;
  readonly name: string;
  process(data: T): Promise<void>;
}
