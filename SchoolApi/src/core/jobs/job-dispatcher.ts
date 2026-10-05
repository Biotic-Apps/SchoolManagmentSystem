import type { QueueName } from './queues';

/** Enqueues background work; implemented by BullMQ or the inline driver. */
export abstract class JobDispatcher {
  abstract dispatch<T>(queue: QueueName, name: string, data: T): Promise<void>;
}
