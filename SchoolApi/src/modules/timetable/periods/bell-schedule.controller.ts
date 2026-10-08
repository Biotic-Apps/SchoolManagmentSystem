import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { BellPlanInput } from '../dto/bell-plan.input';
import { BellScheduleDto } from '../dto/bell-schedule.dto';
import { SetBellScheduleDto } from '../dto/timetable-input.dto';
import { BellScheduleService } from './bell-schedule.service';

@ApiTags('timetable')
@ApiBearerAuth()
@Controller('branches/:id/bell-schedule')
export class BellScheduleController {
  constructor(private readonly bell: BellScheduleService) {}

  @Get()
  @RequirePermission('timetable.view')
  @ApiOperation({
    summary: 'Default bell schedule plus weekday variants (e.g. Friday)',
  })
  @ApiData(BellScheduleDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BellScheduleDto> {
    return this.bell.get(scope, id);
  }

  @Put()
  @RequirePermission('timetable.edit')
  @ApiOperation({
    summary:
      'Replace the whole bell schedule; days missing from `days` fall back to the default',
  })
  @ApiData(BellScheduleDto)
  @ApiConflictResponse({
    description:
      'PERIODS_IN_USE: details list the lessons on removed periods / new breaks (send dropLessons: true to delete them)',
  })
  replace(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SetBellScheduleDto,
  ): Promise<BellScheduleDto> {
    return this.bell.replace(scope, id, body);
  }

  @Post('generate')
  @HttpCode(200)
  @RequirePermission('timetable.edit')
  @ApiOperation({ summary: 'Preview a generated schedule (not saved)' })
  @ApiData(BellScheduleDto)
  generate(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: BellPlanInput,
  ): Promise<BellScheduleDto> {
    return this.bell.generate(scope, id, body);
  }
}
