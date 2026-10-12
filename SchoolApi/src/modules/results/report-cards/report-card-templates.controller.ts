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
  CreateReportCardTemplateDto,
  TemplateQueryDto,
  UpdateReportCardTemplateDto,
} from './dto/template-input.dto';
import { ReportCardTemplateDto } from './dto/template.dto';
import { ReportCardTemplatesService } from './report-card-templates.service';

@ApiTags('report-card-templates')
@ApiBearerAuth()
@Controller('report-card-templates')
export class ReportCardTemplatesController {
  constructor(private readonly templates: ReportCardTemplatesService) {}

  @Post()
  @RequirePermission('exams.manage')
  @ApiData(ReportCardTemplateDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateReportCardTemplateDto,
  ): Promise<ReportCardTemplateDto> {
    return this.templates.create(user, scope, body);
  }

  @Get()
  @RequirePermission('exams.view')
  @ApiPage(ReportCardTemplateDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: TemplateQueryDto,
  ): Promise<PageResult<ReportCardTemplateDto>> {
    return this.templates.list(scope, query);
  }

  @Get(':id')
  @RequirePermission('exams.view')
  @ApiData(ReportCardTemplateDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReportCardTemplateDto> {
    return this.templates.get(scope, id);
  }

  @Patch(':id')
  @RequirePermission('exams.manage')
  @ApiData(ReportCardTemplateDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateReportCardTemplateDto,
  ): Promise<ReportCardTemplateDto> {
    return this.templates.update(user, scope, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermission('exams.manage')
  remove(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.templates.remove(scope, id);
  }

  @Post(':id/set-default')
  @HttpCode(200)
  @RequirePermission('exams.manage')
  @ApiData(ReportCardTemplateDto)
  setDefault(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReportCardTemplateDto> {
    return this.templates.setDefault(scope, id);
  }
}
