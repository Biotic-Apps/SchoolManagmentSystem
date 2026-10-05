import { Module } from '@nestjs/common';
import { CalendarController } from './calendar/calendar.controller';
import { CalendarRepository } from './calendar/calendar.repository';
import { CalendarService } from './calendar/calendar.service';
import { SessionsController } from './sessions.controller';
import { SessionsRepository } from './sessions.repository';
import { SessionsService } from './sessions.service';
import { TermsController } from './terms/terms.controller';
import { TermsRepository } from './terms/terms.repository';
import { TermsService } from './terms/terms.service';

@Module({
  controllers: [SessionsController, TermsController, CalendarController],
  providers: [
    SessionsRepository,
    SessionsService,
    TermsRepository,
    TermsService,
    CalendarRepository,
    CalendarService,
  ],
  exports: [SessionsService],
})
export class AcademicSessionsModule {}
