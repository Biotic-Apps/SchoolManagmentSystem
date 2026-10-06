import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import {
  AssetDto,
  AssetQueryDto,
  CreateAssetDto,
  UpdateAssetDto,
} from '../dto/asset.dto';
import { AssetsService } from './assets.service';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('assets')
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Get()
  @RequirePermission('inventory.view')
  @ApiPage(AssetDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: AssetQueryDto,
  ): Promise<PageResult<AssetDto>> {
    return this.assets.list(scope, query);
  }

  @Post()
  @RequirePermission('inventory.edit', 'inventory.add')
  @ApiData(AssetDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateAssetDto,
  ): Promise<AssetDto> {
    return this.assets.create(user, scope, body);
  }

  @Patch(':id')
  @RequirePermission('inventory.edit')
  @ApiData(AssetDto)
  update(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAssetDto,
  ): Promise<AssetDto> {
    return this.assets.update(scope, id, body);
  }
}
