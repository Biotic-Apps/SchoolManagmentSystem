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
  CreateExamDto,
  ExamDto,
  ExamQueryDto,
  ExamStatusDto,
  UpdateExamDto,
} from './dto/exam.dto';
import { ScheduleExamDto } from './dto/schedule.dto';
import { ExamScheduleService } from './exam-schedule.service';
import { ExamsService } from './exams.service';

@ApiTags('exams')
@ApiBearerAuth()
@Controller('exams')
export class ExamsController {
  constructor(
    private readonly exams: ExamsService,
    private readonly scheduling: ExamScheduleService,
  ) {}

  @Get()
  @RequirePermission('exams.view')
  @ApiPage(ExamDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: ExamQueryDto,
  ): Promise<PageResult<ExamDto>> {
    return this.exams.list(scope, query);
  }

  @Post()
  @RequirePermission('exams.add')
  @ApiData(ExamDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateExamDto,
  ): Promise<ExamDto> {
    return this.exams.create(user, scope, body);
  }

  @Get(':id')
  @RequirePermission('exams.view')
  @ApiData(ExamDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ExamDto> {
    return this.exams.get(scope, id);
  }

  @Patch(':id')
  @RequirePermission('exams.edit')
  @ApiData(ExamDto)
  update(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateExamDto,
  ): Promise<ExamDto> {
    return this.exams.update(scope, id, body);
  }

  @Put(':id/schedule')
  @RequirePermission('exams.edit')
  @ApiData(ExamDto)
  schedule(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ScheduleExamDto,
  ): Promise<ExamDto> {
    return this.scheduling.schedule(scope, id, body);
  }

  @Post(':id/status')
  @HttpCode(200)
  @RequirePermission('exams.edit')
  @ApiData(ExamDto)
  status(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ExamStatusDto,
  ): Promise<ExamDto> {
    return this.exams.setStatus(scope, id, body);
  }
}
