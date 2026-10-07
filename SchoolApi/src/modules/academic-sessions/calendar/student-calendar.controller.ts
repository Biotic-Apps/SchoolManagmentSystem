import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { CalendarEventDto } from '../dto/calendar-event.dto';
import { StudentCalendarQueryDto } from '../dto/student-calendar-query.dto';
import { StudentCalendarService } from './student-calendar.service';

@ApiTags('calendar')
@ApiBearerAuth()
@Controller('students')
export class StudentCalendarController {
  constructor(private readonly calendar: StudentCalendarService) {}

  /** Holidays and events of the student's branch; parents hold no `sessions.view`. */
  @Get(':studentId/calendar')
  @RequirePermission('timetable.view')
  @ApiData(CalendarEventDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query() query: StudentCalendarQueryDto,
  ): Promise<CalendarEventDto[]> {
    return this.calendar.list(scope, studentId, query);
  }
}
