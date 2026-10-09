import { Module } from '@nestjs/common';
import { ActivitiesModule } from '../activities/activities.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { DiaryModule } from '../diary/diary.module';
import { FeesModule } from '../fees/fees.module';
import { TimetableModule } from '../timetable/timetable.module';
import { ChildTodayService } from './daily/child-today.service';
import { PendingService } from './daily/pending.service';
import { TeacherTodayService } from './daily/teacher-today.service';
import { DashboardController } from './dashboard.controller';
import { DashboardRepository } from './dashboard.repository';
import { DashboardService } from './dashboard.service';
import { ParentHomeChildReader } from './parent-home/parent-home-child.reader';
import { ParentHomeController } from './parent-home/parent-home.controller';
import { ParentHomeEventsReader } from './parent-home/parent-home-events.reader';
import { ParentHomeService } from './parent-home/parent-home.service';
import { ParentHomeStatsReader } from './parent-home/parent-home-stats.reader';

@Module({
  imports: [
    ActivitiesModule,
    AttendanceModule,
    DiaryModule,
    FeesModule,
    TimetableModule,
  ],
  controllers: [DashboardController, ParentHomeController],
  providers: [
    DashboardRepository,
    DashboardService,
    PendingService,
    TeacherTodayService,
    ChildTodayService,
    ParentHomeService,
    ParentHomeChildReader,
    ParentHomeStatsReader,
    ParentHomeEventsReader,
  ],
})
export class DashboardModule {}
