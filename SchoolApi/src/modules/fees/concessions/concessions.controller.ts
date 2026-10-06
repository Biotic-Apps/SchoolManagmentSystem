import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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
import { ConcessionReader } from './concession-reader.service';
import { ConcessionsService } from './concessions.service';
import {
  ConcessionDto,
  ConcessionQueryDto,
  CreateConcessionDto,
} from './dto/concession.dto';

@ApiTags('fees')
@ApiBearerAuth()
@Controller('concessions')
export class ConcessionsController {
  constructor(
    private readonly concessions: ConcessionsService,
    private readonly reader: ConcessionReader,
  ) {}

  @Get()
  @RequirePermission('fees.view')
  @ApiPage(ConcessionDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: ConcessionQueryDto,
  ): Promise<PageResult<ConcessionDto>> {
    return this.reader.list(scope, query);
  }

  @Post()
  @RequirePermission('fees.add')
  @ApiData(ConcessionDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateConcessionDto,
  ): Promise<ConcessionDto> {
    return this.concessions.create(user, scope, body);
  }
}
