import { Module } from '@nestjs/common';
import { StudentsModule } from '../students/students.module';
import { BookListsController } from './book-lists/book-lists.controller';
import { BookListsService } from './book-lists/book-lists.service';
import { CoverageController } from './coverage/coverage.controller';
import { CoverageService } from './coverage/coverage.service';
import { DelayReportProcessor } from './jobs/delay-report.processor';
import { PlanApprovalHandler } from './plans/plan-approval.handler';
import { PlansController } from './plans/plans.controller';
import { PlansService } from './plans/plans.service';
import { TopicProgressAction } from './topics/topic-progress.action';
import { TopicProgressService } from './topics/topic-progress.service';
import { TopicsController } from './topics/topics.controller';

@Module({
  imports: [StudentsModule],
  controllers: [
    BookListsController,
    PlansController,
    TopicsController,
    CoverageController,
  ],
  providers: [
    BookListsService,
    PlansService,
    PlanApprovalHandler,
    TopicProgressAction,
    TopicProgressService,
    CoverageService,
    DelayReportProcessor,
  ],
})
export class SyllabusModule {}
