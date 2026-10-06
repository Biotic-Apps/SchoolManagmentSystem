import { Global, Module } from '@nestjs/common';
import { BranchesModule } from '../branches/branches.module';
import { BranchDailyJob } from './branch-daily-job';
import { SchoolPeopleService } from './school-people.service';
import { StudentPlacementService } from './student-placement.service';
import { WorkingDayService } from './working-day.service';

/** Shared helpers of the daily-operation modules (Phase 3). */
@Global()
@Module({
  imports: [BranchesModule],
  providers: [
    WorkingDayService,
    BranchDailyJob,
    SchoolPeopleService,
    StudentPlacementService,
  ],
  exports: [
    BranchesModule,
    WorkingDayService,
    BranchDailyJob,
    SchoolPeopleService,
    StudentPlacementService,
  ],
})
export class SchoolDayModule {}
