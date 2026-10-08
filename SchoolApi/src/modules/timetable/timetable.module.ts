import { Module } from '@nestjs/common';
import { BranchesModule } from '../branches/branches.module';
import { StaffModule } from '../staff/staff.module';
import { StudentsModule } from '../students/students.module';
import { TimetableBuilderService } from './builder/timetable-builder.service';
import { ConflictService } from './conflicts/conflict.service';
import { CellValidator } from './drafts/cell-validator';
import { DraftWriter } from './drafts/draft-writer';
import { TimetableCellsService } from './drafts/timetable-cells.service';
import { TimetablePublisherService } from './drafts/timetable-publisher.service';
import { OverridesController } from './overrides/overrides.controller';
import { OverridesService } from './overrides/overrides.service';
import { BellScheduleController } from './periods/bell-schedule.controller';
import { BellScheduleService } from './periods/bell-schedule.service';
import { PeriodsInUse } from './periods/periods-in-use';
import { PeriodsController } from './periods/periods.controller';
import { PeriodsRepository } from './periods/periods.repository';
import { PeriodsService } from './periods/periods.service';
import { TimetableContextService } from './timetable-context.service';
import { TimetableViewService } from './timetable-view.service';
import { TimetablesController } from './timetables.controller';
import { TimetablesRepository } from './timetables.repository';
import { TimetablesService } from './timetables.service';
import { WeekViewService } from './week-view.service';

@Module({
  imports: [StudentsModule, StaffModule, BranchesModule],
  controllers: [
    PeriodsController,
    BellScheduleController,
    TimetablesController,
    OverridesController,
  ],
  providers: [
    PeriodsRepository,
    PeriodsInUse,
    PeriodsService,
    BellScheduleService,
    TimetablesRepository,
    TimetableContextService,
    ConflictService,
    TimetableViewService,
    CellValidator,
    DraftWriter,
    TimetableCellsService,
    TimetablePublisherService,
    TimetableBuilderService,
    TimetablesService,
    WeekViewService,
    OverridesService,
  ],
  exports: [WeekViewService],
})
export class TimetableModule {}
