import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  ApiData,
  ApiPage,
} from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { HealthAlertsService } from '../alerts/health-alerts.service';
import {
  AlertQueryDto,
  CloseIncidentDto,
  CreateIncidentDto,
  HealthAlertDto,
  IncidentDto,
  IncidentQueryDto,
} from '../dto/health-incident.dto';
import { IncidentsService } from './incidents.service';

@ApiTags('health')
@ApiBearerAuth()
@Controller('health')
export class IncidentsController {
  constructor(
    private readonly incidents: IncidentsService,
    private readonly alerts: HealthAlertsService,
  ) {}

  @Get('alerts')
  @RequirePermission('health.view')
  @ApiData(HealthAlertDto, { isArray: true })
  listAlerts(
    @CurrentScope() scope: Scope,
    @Query() query: AlertQueryDto,
  ): Promise<HealthAlertDto[]> {
    return this.alerts.forSection(scope, query.sectionId);
  }

  @Post('incidents')
  @RequirePermission('health.view')
  @ApiData(IncidentDto)
  report(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateIncidentDto,
  ): Promise<IncidentDto> {
    return this.incidents.report(user, scope, body);
  }

  @Get('incidents')
  @RequirePermission('health.view')
  @ApiPage(IncidentDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: IncidentQueryDto,
  ): Promise<PageResult<IncidentDto>> {
    return this.incidents.list(scope, query);
  }

  @Post('incidents/:id/close')
  @HttpCode(200)
  @RequirePermission('health.edit')
  @ApiData(IncidentDto)
  close(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CloseIncidentDto,
  ): Promise<IncidentDto> {
    return this.incidents.close(user, scope, id, body);
  }
}
