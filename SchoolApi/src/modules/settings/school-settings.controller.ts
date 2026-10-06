import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { SchoolSettingsDto } from './dto/school-settings.dto';
import { UpdateSchoolSettingsDto } from './dto/update-school-settings.dto';
import { SchoolSettingsService } from './school-settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings/school')
export class SchoolSettingsController {
  constructor(private readonly settings: SchoolSettingsService) {}

  @Get(':schoolId')
  @RequirePermission('settings.view')
  @ApiData(SchoolSettingsDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
  ): Promise<SchoolSettingsDto> {
    return this.settings.get(scope, schoolId);
  }

  @Patch(':schoolId')
  @RequirePermission('settings.edit')
  @ApiData(SchoolSettingsDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Body() body: UpdateSchoolSettingsDto,
  ): Promise<SchoolSettingsDto> {
    return this.settings.update(user, scope, schoolId, body);
  }
}
