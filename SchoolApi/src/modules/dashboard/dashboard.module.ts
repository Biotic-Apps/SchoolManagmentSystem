import { Module } from '@nestjs/common';
import { AttendanceModule } from '../attendance/attendance.module';
import { DiaryModule } from '../diary/diary.module';
import { TimetableModule } from '../timetable/timetable.module';
import { ChildTodayService } from './daily/child-today.service';
import { PendingService } from './daily/pending.service';
import { TeacherTodayService } from './daily/teacher-today.service';
import { DashboardController } from './dashboard.controller';
import { DashboardRepository } from './dashboard.repository';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [AttendanceModule, DiaryModule, TimetableModule],
  controllers: [DashboardController],
  providers: [
    DashboardRepository,
    DashboardService,
    PendingService,
    TeacherTodayService,
    ChildTodayService,
  ],
})
export class DashboardModule {}
