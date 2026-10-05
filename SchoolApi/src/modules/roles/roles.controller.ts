import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { OK, OkDto } from '../../core/common/dto/ok.dto';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { describePermission } from '../../core/rbac/permission-description';
import { PERMISSION_CATALOGUE } from '../../core/rbac/permission-catalogue';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { CreateRoleDto } from './dto/create-role.dto';
import { PermissionDto, RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiBearerAuth()
@Controller()
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get('permissions')
  @RequirePermission('roles.view')
  @ApiData(PermissionDto, { isArray: true })
  permissions(): PermissionDto[] {
    return PERMISSION_CATALOGUE.map(describePermission);
  }

  @Get('roles')
  @RequirePermission('roles.view')
  @ApiData(RoleDto, { isArray: true })
  list(@CurrentScope() scope: Scope): Promise<RoleDto[]> {
    return this.roles.list(scope);
  }

  @Post('roles')
  @RequirePermission('roles.add')
  @ApiData(RoleDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateRoleDto,
  ): Promise<RoleDto> {
    return this.roles.create(user, scope, body);
  }

  @Patch('roles/:id')
  @RequirePermission('roles.edit')
  @ApiData(RoleDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateRoleDto,
  ): Promise<RoleDto> {
    return this.roles.update(user, scope, id, body);
  }

  @Delete('roles/:id')
  @RequirePermission('roles.delete')
  @ApiData(OkDto)
  async remove(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OkDto> {
    await this.roles.remove(user, scope, id);
    return OK;
  }
}
