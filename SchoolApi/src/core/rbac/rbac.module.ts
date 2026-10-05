import { Global, Module } from '@nestjs/common';
import { AccessCache } from './access/access-cache';
import { AccessContextService } from './access/access-context.service';
import { AssignmentRepository } from './access/assignment.repository';
import { ScopeService } from './scope/scope.service';

@Global()
@Module({
  providers: [
    AssignmentRepository,
    AccessCache,
    AccessContextService,
    ScopeService,
  ],
  exports: [AccessCache, AccessContextService, ScopeService],
})
export class RbacModule {}
