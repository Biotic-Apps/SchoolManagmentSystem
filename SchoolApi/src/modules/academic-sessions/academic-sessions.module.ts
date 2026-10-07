import { Module } from '@nestjs/common';
import { StudentsModule } from '../students/students.module';
import { CalendarController } from './calendar/calendar.controller';
import { CalendarRepository } from './calendar/calendar.repository';
import { CalendarService } from './calendar/calendar.service';
import { StudentCalendarController } from './calendar/student-calendar.controller';
import { StudentCalendarService } from './calendar/student-calendar.service';
import { SessionsController } from './sessions.controller';
import { SessionsRepository } from './sessions.repository';
import { SessionsService } from './sessions.service';
import { TermsController } from './terms/terms.controller';
import { TermsRepository } from './terms/terms.repository';
import { TermsService } from './terms/terms.service';

@Module({
  imports: [StudentsModule],
  controllers: [
    SessionsController,
    TermsController,
    CalendarController,
    StudentCalendarController,
  ],
  providers: [
    SessionsRepository,
    SessionsService,
    TermsRepository,
    TermsService,
    CalendarRepository,
    CalendarService,
    StudentCalendarService,
  ],
  exports: [SessionsService, SessionsRepository],
})
export class AcademicSessionsModule {}
