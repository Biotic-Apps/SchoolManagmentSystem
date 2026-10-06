import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  CreateDepartureDto,
  DepartureDto,
  DepartureQueryDto,
} from '../dto/pickup.dto';
import { DeparturesService } from './departures.service';

@ApiTags('pickup')
@ApiBearerAuth()
@Controller('departures')
export class DeparturesController {
  constructor(private readonly departures: DeparturesService) {}

  @Post()
  @RequirePermission('pickup.edit')
  @ApiData(DepartureDto)
  record(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateDepartureDto,
  ): Promise<DepartureDto> {
    return this.departures.record(user, scope, body);
  }

  @Get()
  @RequirePermission('pickup.view')
  @ApiData(DepartureDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: DepartureQueryDto,
  ): Promise<DepartureDto[]> {
    return this.departures.list(scope, query);
  }
}
