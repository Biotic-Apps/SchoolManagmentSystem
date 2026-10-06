import { Global, Module } from '@nestjs/common';
import { AsyncTaskService } from './async-task.service';
import { JobsController } from './jobs.controller';

/** Pollable background jobs (`GET /jobs/:id`). */
@Global()
@Module({
  controllers: [JobsController],
  providers: [AsyncTaskService],
  exports: [AsyncTaskService],
})
export class TasksModule {}
