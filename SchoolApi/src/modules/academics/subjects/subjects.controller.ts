import {
  Body,
  Controller,
  Get,
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
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { SchoolQueryDto } from '../dto/school-query.dto';
import { SubjectDto } from '../dto/subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { SubjectsService } from './subjects.service';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjects: SubjectsService) {}

  @Get()
  @RequirePermission('classes.view')
  @ApiPage(SubjectDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: SchoolQueryDto,
  ): Promise<PageResult<SubjectDto>> {
    return this.subjects.list(scope, query);
  }

  @Post()
  @RequirePermission('classes.add')
  @ApiData(SubjectDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateSubjectDto,
  ): Promise<SubjectDto> {
    return this.subjects.create(user, scope, body);
  }

  @Patch(':id')
  @RequirePermission('classes.edit')
  @ApiData(SubjectDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateSubjectDto,
  ): Promise<SubjectDto> {
    return this.subjects.update(user, scope, id, body);
  }
}
