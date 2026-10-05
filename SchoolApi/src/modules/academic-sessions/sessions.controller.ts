import {
  Body,
  Controller,
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
import { AcademicSessionDto } from './dto/academic-session.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionQueryDto } from './dto/session-query.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionsService } from './sessions.service';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Get()
  @RequirePermission('sessions.view')
  @ApiPage(AcademicSessionDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: SessionQueryDto,
  ): Promise<PageResult<AcademicSessionDto>> {
    return this.sessions.list(scope, query);
  }

  @Post()
  @RequirePermission('sessions.add')
  @ApiData(AcademicSessionDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateSessionDto,
  ): Promise<AcademicSessionDto> {
    return this.sessions.create(user, scope, body);
  }

  @Patch(':id')
  @RequirePermission('sessions.edit')
  @ApiData(AcademicSessionDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateSessionDto,
  ): Promise<AcademicSessionDto> {
    return this.sessions.update(user, scope, id, body);
  }

  @Post(':id/activate')
  @HttpCode(200)
  @RequirePermission('sessions.edit')
  @ApiData(AcademicSessionDto)
  activate(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AcademicSessionDto> {
    return this.sessions.activate(user, scope, id);
  }

  @Post(':id/close')
  @HttpCode(200)
  @RequirePermission('sessions.edit')
  @ApiData(AcademicSessionDto)
  close(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AcademicSessionDto> {
    return this.sessions.close(user, scope, id);
  }
}
