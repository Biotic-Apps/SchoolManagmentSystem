import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
import { CreateClassDto } from '../dto/create-class.dto';
import { SchoolClassDto } from '../dto/school-class.dto';
import { SchoolQueryDto } from '../dto/school-query.dto';
import { ClassSubjectDto } from '../dto/class-subject.dto';
import {
  ReorderClassesDto,
  SetClassSubjectsDto,
} from '../dto/set-class-subjects.dto';
import { SubjectDto } from '../dto/subject.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { ClassCurriculumService } from './class-curriculum.service';
import { ClassesService } from './classes.service';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classes: ClassesService,
    private readonly curriculum: ClassCurriculumService,
  ) {}

  @Get()
  @RequirePermission('classes.view')
  @ApiPage(SchoolClassDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: SchoolQueryDto,
  ): Promise<PageResult<SchoolClassDto>> {
    return this.classes.list(scope, query);
  }

  @Post()
  @RequirePermission('classes.add')
  @ApiData(SchoolClassDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateClassDto,
  ): Promise<SchoolClassDto> {
    return this.classes.create(user, scope, body);
  }

  @Patch(':id')
  @RequirePermission('classes.edit')
  @ApiData(SchoolClassDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateClassDto,
  ): Promise<SchoolClassDto> {
    return this.classes.update(user, scope, id, body);
  }

  @Get(':id/subjects')
  @RequirePermission('classes.view')
  @ApiData(SubjectDto, { isArray: true })
  subjects(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SubjectDto[]> {
    return this.classes.subjects(scope, id);
  }

  @Put(':id/subjects')
  @RequirePermission('classes.edit')
  @ApiOperation({
    summary:
      'Set the class curriculum (items order = sortOrder); 409 SUBJECT_IN_USE when a removed subject is still taught',
  })
  @ApiData(ClassSubjectDto, { isArray: true })
  setSubjects(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SetClassSubjectsDto,
  ): Promise<ClassSubjectDto[]> {
    return this.curriculum.set(scope, id, body);
  }

  @Put('order')
  @HttpCode(204)
  @RequirePermission('classes.edit')
  @ApiOperation({
    summary: 'Reorder all classes of a school (levelOrder 1..n)',
  })
  async reorder(
    @CurrentScope() scope: Scope,
    @Body() body: ReorderClassesDto,
  ): Promise<void> {
    await this.curriculum.reorder(scope, body);
  }
}
