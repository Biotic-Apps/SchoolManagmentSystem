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
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  CreateGradingSchemeDto,
  GradingSchemeDto,
  GradingSchemeQueryDto,
  UpdateGradingSchemeDto,
} from './dto/grading-scheme.dto';
import { GradingSchemesService } from './grading-schemes.service';

@ApiTags('exams')
@ApiBearerAuth()
@Controller('grading-schemes')
export class GradingSchemesController {
  constructor(private readonly schemes: GradingSchemesService) {}

  @Get()
  @RequirePermission('exams.view')
  @ApiData(GradingSchemeDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: GradingSchemeQueryDto,
  ): Promise<GradingSchemeDto[]> {
    return this.schemes.list(scope, query);
  }

  @Post()
  @RequirePermission('exams.add')
  @ApiData(GradingSchemeDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateGradingSchemeDto,
  ): Promise<GradingSchemeDto> {
    return this.schemes.create(user, scope, body);
  }

  @Patch(':id')
  @RequirePermission('exams.edit')
  @ApiData(GradingSchemeDto)
  update(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateGradingSchemeDto,
  ): Promise<GradingSchemeDto> {
    return this.schemes.update(scope, id, body);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermission('exams.approve')
  @ApiData(GradingSchemeDto)
  approve(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GradingSchemeDto> {
    return this.schemes.approve(user, scope, id);
  }
}
