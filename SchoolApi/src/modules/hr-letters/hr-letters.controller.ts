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
import {
  CreateHrLetterTemplateDto,
  HrLetterTemplateDto,
  HrLetterTemplateQueryDto,
  UpdateHrLetterTemplateDto,
} from './hr-letter-template.dto';
import { GenerateHrLetterDto, HrLetterDto } from './hr-letter.dto';
import { HrLettersService } from './hr-letters.service';

@ApiTags('hr-letters')
@ApiBearerAuth()
@Controller()
export class HrLettersController {
  constructor(private readonly service: HrLettersService) {}

  // ── Templates ──

  @Post('hr-letter-templates')
  @RequirePermission('staff.edit')
  @ApiData(HrLetterTemplateDto)
  createTemplate(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateHrLetterTemplateDto,
  ): Promise<HrLetterTemplateDto> {
    return this.service.createTemplate(user, scope, body);
  }

  @Get('hr-letter-templates')
  @RequirePermission('staff.view')
  @ApiPage(HrLetterTemplateDto)
  listTemplates(
    @CurrentScope() scope: Scope,
    @Query() query: HrLetterTemplateQueryDto,
  ): Promise<PageResult<HrLetterTemplateDto>> {
    return this.service.listTemplates(scope, query);
  }

  @Patch('hr-letter-templates/:id')
  @RequirePermission('staff.edit')
  @ApiData(HrLetterTemplateDto)
  updateTemplate(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateHrLetterTemplateDto,
  ): Promise<HrLetterTemplateDto> {
    return this.service.updateTemplate(user, scope, id, body);
  }

  @Delete('hr-letter-templates/:id')
  @HttpCode(204)
  @RequirePermission('staff.edit')
  deleteTemplate(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.service.deleteTemplate(user, scope, id);
  }

  // ── Staff letters ──

  @Get('staff/:staffId/hr-letters')
  @RequirePermission('staff.view')
  @ApiData(HrLetterDto, { isArray: true })
  listLetters(
    @CurrentScope() scope: Scope,
    @Param('staffId', ParseUUIDPipe) staffId: string,
  ): Promise<HrLetterDto[]> {
    return this.service.listLetters(scope, staffId);
  }

  @Post('staff/:staffId/hr-letters')
  @RequirePermission('staff.edit')
  @ApiData(HrLetterDto)
  generateLetter(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Body() body: GenerateHrLetterDto,
  ): Promise<HrLetterDto> {
    return this.service.generateLetter(user, scope, staffId, body);
  }

  @Get('hr-letters/:id')
  @RequirePermission('staff.view')
  @ApiData(HrLetterDto)
  getLetter(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<HrLetterDto> {
    return this.service.getLetter(scope, id);
  }

  @Get('hr-letters/:id/download')
  @RequirePermission('staff.view')
  @ApiData(Object)
  download(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ fileUrl: string }> {
    return this.service.getDownloadUrl(scope, id);
  }
}
