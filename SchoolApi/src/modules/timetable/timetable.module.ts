import { Module } from '@nestjs/common';
import { StudentsModule } from '../students/students.module';
import { OverridesController } from './overrides/overrides.controller';
import { OverridesService } from './overrides/overrides.service';
import { PeriodsController } from './periods/periods.controller';
import { PeriodsService } from './periods/periods.service';
import { TimetablesController } from './timetables.controller';
import { TimetablesRepository } from './timetables.repository';
import { TimetablesService } from './timetables.service';
import { WeekViewService } from './week-view.service';

@Module({
  imports: [StudentsModule],
  controllers: [PeriodsController, TimetablesController, OverridesController],
  providers: [
    PeriodsService,
    TimetablesRepository,
    TimetablesService,
    WeekViewService,
    OverridesService,
  ],
})
export class TimetableModule {}
