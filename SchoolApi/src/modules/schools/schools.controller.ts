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
import { ListQueryDto } from '../../core/common/pagination/list-query.dto';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { CreateSchoolDto } from './dto/create-school.dto';
import { SchoolDto } from './dto/school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { SchoolsService } from './schools.service';

@ApiTags('schools')
@ApiBearerAuth()
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schools: SchoolsService) {}

  @Get()
  @RequirePermission('schools.view')
  @ApiPage(SchoolDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: ListQueryDto,
  ): Promise<PageResult<SchoolDto>> {
    return this.schools.list(scope, query);
  }

  @Post()
  @RequirePermission('schools.add')
  @ApiData(SchoolDto)
  create(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateSchoolDto,
  ): Promise<SchoolDto> {
    return this.schools.create(user, body);
  }

  @Get(':id')
  @RequirePermission('schools.view')
  @ApiData(SchoolDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SchoolDto> {
    return this.schools.get(scope, id);
  }

  @Patch(':id')
  @RequirePermission('schools.edit')
  @ApiData(SchoolDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateSchoolDto,
  ): Promise<SchoolDto> {
    return this.schools.update(user, scope, id, body);
  }

  @Post(':id/archive')
  @HttpCode(200)
  @RequirePermission('schools.delete')
  @ApiData(SchoolDto)
  archive(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SchoolDto> {
    return this.schools.setStatus(user, scope, id, 'ARCHIVED');
  }

  @Post(':id/activate')
  @HttpCode(200)
  @RequirePermission('schools.edit')
  @ApiData(SchoolDto)
  activate(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SchoolDto> {
    return this.schools.setStatus(user, scope, id, 'ACTIVE');
  }
}
