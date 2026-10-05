import { Injectable } from '@nestjs/common';
import type { JobProcessor } from './job-processor';
import type { QueueName } from './queues';

@Injectable()
export class JobProcessorRegistry {
  private readonly processors = new Map<string, JobProcessor>();

  register(processor: JobProcessor<any>): void {
    this.processors.set(this.key(processor.queue, processor.name), processor);
  }

  get(queue: QueueName, name: string): JobProcessor {
    const processor = this.processors.get(this.key(queue, name));
    if (!processor) throw new Error(`No processor for job ${queue}/${name}`);
    return processor;
  }

  private key(queue: string, name: string): string {
    return `${queue}/${name}`;
  }
}
