import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ParentHomeDto, ParentHomeQueryDto } from './parent-home.dto';
import { ParentHomeService } from './parent-home.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('parent')
export class ParentHomeController {
  constructor(private readonly parentHome: ParentHomeService) {}

  /** Parent dashboard for one verified child (guardian scope only; others get 404). */
  @Get('home')
  @RequirePermission('dashboard.view')
  @ApiData(ParentHomeDto)
  home(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: ParentHomeQueryDto,
  ): Promise<ParentHomeDto> {
    return this.parentHome.home(user, scope, query.studentId);
  }
}
