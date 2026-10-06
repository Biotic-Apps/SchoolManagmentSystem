import { Global, Module } from '@nestjs/common';
import { SequenceService } from '../sequences/sequence.service';
import { OutboxService } from './outbox.service';

/** Transaction helpers shared by modules: outbox and numbered sequences. */
@Global()
@Module({
  providers: [OutboxService, SequenceService],
  exports: [OutboxService, SequenceService],
})
export class OutboxModule {}
