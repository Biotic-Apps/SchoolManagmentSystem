import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { TimetableBuilderService } from './builder/timetable-builder.service';
import { CellParamsDto } from './dto/cell-params.dto';
import {
  CellResultDto,
  TimetableBuilderDto,
} from './dto/timetable-builder.dto';
import {
  SectionQueryParamDto,
  SetCellDto,
  SetSlotsDto,
  WeekQueryDto,
} from './dto/timetable-input.dto';
import {
  ConflictsDto,
  TeacherSlotDto,
  TimetableDto,
} from './dto/timetable.dto';
import { TimetableCellsService } from './drafts/timetable-cells.service';
import { TimetablePublisherService } from './drafts/timetable-publisher.service';
import { TimetablesService } from './timetables.service';
import { WeekViewService } from './week-view.service';

@ApiTags('timetable')
@ApiBearerAuth()
@Controller('timetables')
export class TimetablesController {
  constructor(
    private readonly timetables: TimetablesService,
    private readonly weeks: WeekViewService,
    private readonly cells: TimetableCellsService,
    private readonly publisher: TimetablePublisherService,
    private readonly builders: TimetableBuilderService,
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

  @Get(':sectionId/builder')
  @RequirePermission('timetable.edit')
  @ApiOperation({ summary: 'Everything the timetable builder needs' })
  @ApiData(TimetableBuilderDto)
  builder(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
  ): Promise<TimetableBuilderDto> {
    return this.builders.builder(user, scope, sectionId);
  }

  @Put(':sectionId/slots/:day/:periodIndex')
  @RequirePermission('timetable.edit')
  @ApiOperation({ summary: 'Autosave one lesson into the draft' })
  @ApiData(CellResultDto)
  putCell(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param() params: CellParamsDto,
    @Body() body: SetCellDto,
  ): Promise<CellResultDto> {
    return this.cells.put(user, scope, params.sectionId, params, body);
  }

  @Delete(':sectionId/slots/:day/:periodIndex')
  @RequirePermission('timetable.edit')
  @ApiOperation({ summary: 'Remove one lesson from the draft (idempotent)' })
  @ApiData(CellResultDto)
  deleteCell(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param() params: CellParamsDto,
  ): Promise<CellResultDto> {
    return this.cells.remove(user, scope, params.sectionId, params);
  }

  @Put(':sectionId/slots')
  @RequirePermission('timetable.edit')
  @ApiOperation({ summary: 'Replace the whole draft (auto-fill, copy)' })
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
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
  ): Promise<ConflictsDto> {
    return {
      conflicts: await this.timetables.check(user, scope, sectionId),
    };
  }

  @Post(':sectionId/publish')
  @HttpCode(200)
  @RequirePermission('timetable.publish')
  @ApiData(TimetableDto)
  @ApiConflictResponse({
    description:
      'NOTHING_TO_PUBLISH | TIMETABLE_CONFLICTS (details = error conflicts)',
  })
  publish(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
  ): Promise<TimetableDto> {
    return this.publisher.publish(user, scope, sectionId);
  }

  @Post(':sectionId/discard')
  @HttpCode(200)
  @RequirePermission('timetable.publish')
  @ApiData(TimetableDto)
  @ApiConflictResponse({ description: 'NOTHING_TO_DISCARD' })
  discard(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
  ): Promise<TimetableDto> {
    return this.publisher.discard(user, scope, sectionId);
  }
}
