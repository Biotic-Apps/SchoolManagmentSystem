import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  CreateOverrideDto,
  OverrideQueryDto,
} from '../dto/timetable-input.dto';
import { OverrideDto } from '../dto/timetable.dto';
import { OverridesService } from './overrides.service';

@ApiTags('timetable')
@ApiBearerAuth()
@Controller('timetable-overrides')
export class OverridesController {
  constructor(private readonly overrides: OverridesService) {}

  @Get()
  @RequirePermission('timetable.view')
  @ApiData(OverrideDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: OverrideQueryDto,
  ): Promise<OverrideDto[]> {
    return this.overrides.list(scope, query);
  }

  @Post()
  @RequirePermission('timetable.edit')
  @ApiData(OverrideDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateOverrideDto,
  ): Promise<OverrideDto> {
    return this.overrides.create(user, scope, body);
  }

  @Delete(':id')
  @RequirePermission('timetable.edit')
  @ApiData(OverrideDto)
  cancel(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OverrideDto> {
    return this.overrides.cancel(user, scope, id);
  }
}
