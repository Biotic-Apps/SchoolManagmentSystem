import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SetPeriodsDto } from '../dto/timetable-input.dto';
import { PeriodDto } from '../dto/timetable.dto';
import { PeriodsService } from './periods.service';

/** Legacy default-schedule endpoints; prefer /branches/:id/bell-schedule. */
@ApiTags('timetable')
@ApiBearerAuth()
@Controller('branches/:id/periods')
export class PeriodsController {
  constructor(private readonly periods: PeriodsService) {}

  @Get()
  @RequirePermission('timetable.view')
  @ApiData(PeriodDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PeriodDto[]> {
    return this.periods.list(scope, id);
  }

  @Put()
  @RequirePermission('timetable.edit')
  @ApiData(PeriodDto, { isArray: true })
  replace(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SetPeriodsDto,
  ): Promise<PeriodDto[]> {
    return this.periods.replace(scope, id, body.periods, body.dropLessons);
  }
}
