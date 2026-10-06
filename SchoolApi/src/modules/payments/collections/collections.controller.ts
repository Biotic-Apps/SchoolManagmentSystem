import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { CollectionsService } from './collections.service';
import {
  CloseDayDto,
  DailyCollectionDto,
  DailyCollectionQueryDto,
} from './dto/collection.dto';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('collections/daily')
export class CollectionsController {
  constructor(private readonly collections: CollectionsService) {}

  @Get()
  @RequirePermission('fees.view')
  @ApiData(DailyCollectionDto)
  daily(
    @CurrentScope() scope: Scope,
    @Query() query: DailyCollectionQueryDto,
  ): Promise<DailyCollectionDto> {
    return this.collections.daily(scope, query.branchId, query.date);
  }

  @Post('close')
  @HttpCode(200)
  @RequirePermission('fees.approve')
  @ApiData(DailyCollectionDto)
  close(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CloseDayDto,
  ): Promise<DailyCollectionDto> {
    return this.collections.close(user, scope, body);
  }
}
