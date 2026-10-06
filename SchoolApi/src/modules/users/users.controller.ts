import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import type { PageResult } from '../../core/common/pagination/page-result';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { AssignmentsService } from './assignments.service';
import { AssignmentInputDto } from './dto/assignment-input.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CreatedUserDto,
  TemporaryPasswordDto,
  UserDetailDto,
  UserSummaryDto,
} from './dto/user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly assignments: AssignmentsService,
  ) {}

  @Get()
  @RequirePermission('users.view')
  @ApiPage(UserSummaryDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: UserQueryDto,
  ): Promise<PageResult<UserSummaryDto>> {
    return this.users.list(scope, query);
  }

  @Post()
  @RequirePermission('users.add')
  @ApiData(CreatedUserDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateUserDto,
  ): Promise<CreatedUserDto> {
    return this.users.create(user, scope, body);
  }

  @Get(':id')
  @RequirePermission('users.view')
  @ApiData(UserDetailDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserDetailDto> {
    return this.users.get(scope, id);
  }

  @Patch(':id')
  @RequirePermission('users.edit')
  @ApiData(UserDetailDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserDto,
  ): Promise<UserDetailDto> {
    return this.users.update(user, scope, id, body);
  }

  @Post(':id/disable')
  @HttpCode(200)
  @RequirePermission('users.edit')
  @ApiData(UserDetailDto)
  disable(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserDetailDto> {
    return this.users.setStatus(user, scope, id, 'DISABLED');
  }

  @Post(':id/enable')
  @HttpCode(200)
  @RequirePermission('users.edit')
  @ApiData(UserDetailDto)
  enable(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserDetailDto> {
    return this.users.setStatus(user, scope, id, 'ACTIVE');
  }

  @Post(':id/unlock')
  @HttpCode(200)
  @RequirePermission('users.edit')
  @ApiData(UserDetailDto)
  unlock(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserDetailDto> {
    return this.users.unlock(user, scope, id);
  }

  @Post(':id/reset-password')
  @HttpCode(200)
  @RequirePermission('users.edit')
  @ApiData(TemporaryPasswordDto)
  resetPassword(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TemporaryPasswordDto> {
    return this.users.resetPassword(user, scope, id);
  }

  @Post(':id/assignments')
  @RequirePermission('users.edit')
  @ApiData(UserDetailDto)
  addAssignment(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AssignmentInputDto,
  ): Promise<UserDetailDto> {
    return this.assignments.add(user, scope, id, body);
  }

  @Delete(':id/assignments/:assignmentId')
  @RequirePermission('users.edit')
  @ApiData(UserDetailDto)
  removeAssignment(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
  ): Promise<UserDetailDto> {
    return this.assignments.remove(user, scope, id, assignmentId);
  }
}
