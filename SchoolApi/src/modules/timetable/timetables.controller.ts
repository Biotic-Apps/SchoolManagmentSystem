import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  SectionQueryParamDto,
  SetSlotsDto,
  WeekQueryDto,
} from './dto/timetable-input.dto';
import {
  ConflictsDto,
  TeacherSlotDto,
  TimetableDto,
} from './dto/timetable.dto';
import { TimetablesService } from './timetables.service';
import { WeekViewService } from './week-view.service';

@ApiTags('timetable')
@ApiBearerAuth()
@Controller('timetables')
export class TimetablesController {
  constructor(
    private readonly timetables: TimetablesService,
    private readonly weeks: WeekViewService,
  ) {}

  @Get()
  @RequirePermission('timetable.view')
  @ApiData(TimetableDto)
  get(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: SectionQueryParamDto,
  ): Promise<TimetableDto> {
    return this.timetables.get(user, scope, query.sectionId);
  }

  @Get('me')
  @RequirePermission('timetable.view')
  @ApiData(TeacherSlotDto, { isArray: true })
  me(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: WeekQueryDto,
  ): Promise<TeacherSlotDto[]> {
    return this.weeks.forMe(user, scope, query.weekOf, query.studentId);
  }

  @Get('teacher/:staffId')
  @RequirePermission('timetable.view')
  @ApiData(TeacherSlotDto, { isArray: true })
  teacher(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Query() query: WeekQueryDto,
  ): Promise<TeacherSlotDto[]> {
    return this.weeks.forTeacher(user, scope, staffId, query.weekOf);
  }

  @Put(':sectionId/slots')
  @RequirePermission('timetable.edit')
  @ApiData(TimetableDto)
  replace(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() body: SetSlotsDto,
  ): Promise<TimetableDto> {
    return this.timetables.replaceDraft(user, scope, sectionId, body);
  }

  @Post(':sectionId/check')
  @HttpCode(200)
  @RequirePermission('timetable.edit')
  @ApiData(ConflictsDto)
  async check(
    @CurrentScope() scope: Scope,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
  ): Promise<ConflictsDto> {
    return { conflicts: await this.timetables.check(scope, sectionId) };
  }

  @Post(':sectionId/publish')
  @HttpCode(200)
  @RequirePermission('timetable.publish')
  @ApiData(TimetableDto)
  publish(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
  ): Promise<TimetableDto> {
    return this.timetables.publish(user, scope, sectionId);
  }
}
