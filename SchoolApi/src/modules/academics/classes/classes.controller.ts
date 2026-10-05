import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
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
import { CreateClassDto } from '../dto/create-class.dto';
import { SchoolClassDto } from '../dto/school-class.dto';
import { SchoolQueryDto } from '../dto/school-query.dto';
import { SetClassSubjectsDto } from '../dto/set-class-subjects.dto';
import { SubjectDto } from '../dto/subject.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { ClassesService } from './classes.service';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('classes')
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

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
  @ApiData(SubjectDto, { isArray: true })
  setSubjects(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SetClassSubjectsDto,
  ): Promise<SubjectDto[]> {
    return this.classes.setSubjects(scope, id, body.subjectIds);
  }
}
