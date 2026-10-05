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
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  ApiData,
  ApiPage,
} from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { CreateSectionDto } from '../dto/create-section.dto';
import { SectionDto } from '../dto/section.dto';
import { SectionQueryDto } from '../dto/section-query.dto';
import { UpdateSectionDto } from '../dto/update-section.dto';
import { SectionsService } from './sections.service';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('sections')
export class SectionsController {
  constructor(private readonly sections: SectionsService) {}

  @Get()
  @RequirePermission('classes.view')
  @ApiPage(SectionDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: SectionQueryDto,
  ): Promise<PageResult<SectionDto>> {
    return this.sections.list(scope, query);
  }

  @Post()
  @RequirePermission('classes.add')
  @ApiData(SectionDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateSectionDto,
  ): Promise<SectionDto> {
    return this.sections.create(user, scope, body);
  }

  @Patch(':id')
  @RequirePermission('classes.edit')
  @ApiData(SectionDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateSectionDto,
  ): Promise<SectionDto> {
    return this.sections.update(user, scope, id, body);
  }

  @Post(':id/archive')
  @HttpCode(200)
  @RequirePermission('classes.delete')
  @ApiData(SectionDto)
  archive(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SectionDto> {
    return this.sections.archive(user, scope, id);
  }
}
