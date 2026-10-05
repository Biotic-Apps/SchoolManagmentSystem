import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { OK, OkDto } from '../../../core/common/dto/ok.dto';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { CalendarEventDto } from '../dto/calendar-event.dto';
import { CalendarQueryDto } from '../dto/calendar-query.dto';
import { CreateCalendarEventDto } from '../dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from '../dto/update-calendar-event.dto';
import { CalendarService } from './calendar.service';

@ApiTags('calendar')
@ApiBearerAuth()
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  @Get()
  @RequirePermission('sessions.view')
  @ApiData(CalendarEventDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: CalendarQueryDto,
  ): Promise<CalendarEventDto[]> {
    return this.calendar.list(scope, query);
  }

  @Post()
  @RequirePermission('sessions.edit')
  @ApiData(CalendarEventDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateCalendarEventDto,
  ): Promise<CalendarEventDto> {
    return this.calendar.create(user, scope, body);
  }

  @Patch(':id')
  @RequirePermission('sessions.edit')
  @ApiData(CalendarEventDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCalendarEventDto,
  ): Promise<CalendarEventDto> {
    return this.calendar.update(user, scope, id, body);
  }

  @Delete(':id')
  @RequirePermission('sessions.edit')
  @ApiData(OkDto)
  async remove(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OkDto> {
    await this.calendar.remove(user, scope, id);
    return OK;
  }
}
