import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ClassOverviewDto, ClassSetupDto } from '../dto/class-overview.dto';
import { ClassSetupQueryDto } from '../dto/class-setup-query.dto';
import { ClassSetupService } from './class-setup.service';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('classes')
export class ClassSetupController {
  constructor(private readonly setup: ClassSetupService) {}

  @Get('overview')
  @RequirePermission('classes.view')
  @ApiOperation({
    summary:
      'One card per class: sections, subjects, issues (branch + session)',
  })
  @ApiData(ClassOverviewDto, { isArray: true })
  overview(
    @CurrentScope() scope: Scope,
    @Query() query: ClassSetupQueryDto,
  ): Promise<ClassOverviewDto[]> {
    return this.setup.overview(scope, query);
  }

  @Get(':id/setup')
  @RequirePermission('classes.view')
  @ApiOperation({
    summary: 'Class setup screen: sections, curriculum, teacher allocation',
  })
  @ApiData(ClassSetupDto)
  classSetup(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ClassSetupQueryDto,
  ): Promise<ClassSetupDto> {
    return this.setup.setup(user, scope, id, query);
  }
}
