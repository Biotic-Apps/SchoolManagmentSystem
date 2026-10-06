import { Global, Module } from '@nestjs/common';
import { ClientRequestService } from './client-request.service';

@Global()
@Module({
  providers: [ClientRequestService],
  exports: [ClientRequestService],
})
export class IdempotencyModule {}
