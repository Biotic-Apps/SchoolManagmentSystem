import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { HealthChangeService } from '../change-request/health-change.service';
import {
  HealthChangeRequestDto,
  HealthChangeResultDto,
  HealthProfileDto,
  HealthProfileInputDto,
} from '../dto/health-profile.dto';
import { HealthProfileService } from './health-profile.service';

@ApiTags('health')
@ApiBearerAuth()
@Controller('students/:id/health')
export class HealthProfileController {
  constructor(
    private readonly profiles: HealthProfileService,
    private readonly changes: HealthChangeService,
  ) {}

  @Get()
  @RequirePermission('health.view')
  @ApiData(HealthProfileDto)
  read(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<HealthProfileDto> {
    return this.profiles.read(user, scope, id);
  }

  @Put()
  @RequirePermission('health.edit')
  @ApiData(HealthProfileDto)
  replace(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: HealthProfileInputDto,
  ): Promise<HealthProfileDto> {
    return this.profiles.replace(user, scope, id, body);
  }

  @Post('change-requests')
  @RequirePermission('health.submit')
  @ApiData(HealthChangeResultDto)
  requestChange(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: HealthChangeRequestDto,
  ): Promise<HealthChangeResultDto> {
    return this.changes.request(user, scope, id, body.changes);
  }
}
