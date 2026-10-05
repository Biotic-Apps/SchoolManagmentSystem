import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import type { PageResult } from '../../core/common/pagination/page-result';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { BranchesService } from './branches.service';
import { BranchDto } from './dto/branch.dto';
import { BranchQueryDto } from './dto/branch-query.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { SetPrincipalDto } from './dto/set-principal.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PrincipalService } from './principal/principal.service';
import { BranchSettingsService } from './settings/branch-settings.service';

const SETTINGS_SCHEMA = {
  schema: {
    type: 'object',
    properties: { data: { type: 'object', additionalProperties: true } },
  },
};

@ApiTags('branches')
@ApiBearerAuth()
@Controller('branches')
export class BranchesController {
  constructor(
    private readonly branches: BranchesService,
    private readonly settings: BranchSettingsService,
    private readonly principals: PrincipalService,
  ) {}

  @Get()
  @RequirePermission('branches.view')
  @ApiPage(BranchDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: BranchQueryDto,
  ): Promise<PageResult<BranchDto>> {
    return this.branches.list(scope, query);
  }

  @Post()
  @RequirePermission('branches.add')
  @ApiData(BranchDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateBranchDto,
  ): Promise<BranchDto> {
    return this.branches.create(user, scope, body);
  }

  @Get(':id')
  @RequirePermission('branches.view')
  @ApiData(BranchDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BranchDto> {
    return this.branches.get(scope, id);
  }

  @Patch(':id')
  @RequirePermission('branches.edit')
  @ApiData(BranchDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBranchDto,
  ): Promise<BranchDto> {
    return this.branches.update(user, scope, id, body);
  }

  @Post(':id/archive')
  @HttpCode(200)
  @RequirePermission('branches.delete')
  @ApiData(BranchDto)
  archive(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BranchDto> {
    return this.branches.setStatus(user, scope, id, 'ARCHIVED');
  }

  @Post(':id/activate')
  @HttpCode(200)
  @RequirePermission('branches.edit')
  @ApiData(BranchDto)
  activate(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BranchDto> {
    return this.branches.setStatus(user, scope, id, 'ACTIVE');
  }

  @Put(':id/principal')
  @RequirePermission('users.edit')
  @ApiData(BranchDto)
  setPrincipal(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SetPrincipalDto,
  ): Promise<BranchDto> {
    return this.principals.change(user, scope, id, body.userId);
  }

  @Get(':id/settings')
  @RequirePermission('branches.view')
  @ApiOkResponse(SETTINGS_SCHEMA)
  getSettings(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Record<string, unknown>> {
    return this.settings.get(scope, id);
  }

  @Patch(':id/settings')
  @RequirePermission('settings.edit', 'branches.edit')
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  @ApiOkResponse(SETTINGS_SCHEMA)
  updateSettings(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.settings.update(user, scope, id, body);
  }
}
