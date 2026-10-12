import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { HomeworkService } from './homework.service';
import {
  CreateHomeworkDto,
  GradeSubmissionDto,
  HomeworkDto,
  HomeworkQueryDto,
  HomeworkSubmissionDto,
  SubmissionQueryDto,
  SubmitHomeworkDto,
  UpdateHomeworkDto,
} from './dto/homework.dto';

@ApiTags('homework')
@ApiBearerAuth()
@Controller('homework')
export class HomeworkController {
  constructor(private readonly homework: HomeworkService) {}

  // ─── Teacher endpoints ──────────────────────────────────────

  @Get()
  @RequirePermission('homework.view')
  @ApiData(HomeworkDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: HomeworkQueryDto,
  ): Promise<HomeworkDto[]> {
    return this.homework.list(scope, query);
  }

  @Post()
  @RequirePermission('homework.add')
  @ApiData(HomeworkDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateHomeworkDto,
  ): Promise<HomeworkDto> {
    return this.homework.create(user, scope, body);
  }

  @Put(':id')
  @RequirePermission('homework.edit')
  @ApiData(HomeworkDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateHomeworkDto,
  ): Promise<HomeworkDto> {
    return this.homework.update(user, scope, id, body);
  }

  @Delete(':id')
  @RequirePermission('homework.delete')
  @ApiData(HomeworkDto)
  archive(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<HomeworkDto> {
    return this.homework.archive(scope, id);
  }

  // ─── Submission management (teacher) ────────────────────────

  @Get(':id/submissions')
  @RequirePermission('homework.view')
  @ApiData(HomeworkSubmissionDto, { isArray: true })
  listSubmissions(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: SubmissionQueryDto,
  ): Promise<HomeworkSubmissionDto[]> {
    return this.homework.listSubmissions(scope, id, query);
  }

  @Post('submissions/:submissionId/grade')
  @HttpCode(200)
  @RequirePermission('homework.edit')
  @ApiData(HomeworkSubmissionDto)
  grade(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() body: GradeSubmissionDto,
  ): Promise<HomeworkSubmissionDto> {
    return this.homework.grade(user, scope, submissionId, body);
  }

  @Post('submissions/:submissionId/return')
  @HttpCode(200)
  @RequirePermission('homework.edit')
  @ApiData(HomeworkSubmissionDto)
  returnSubmission(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() body: { feedback: string },
  ): Promise<HomeworkSubmissionDto> {
    return this.homework.returnSubmission(
      user,
      scope,
      submissionId,
      body.feedback,
    );
  }

  // ─── Student / Parent endpoints ─────────────────────────────

  @Get('student/:studentId')
  @RequirePermission('homework.view', 'homework.submit')
  @ApiData(HomeworkDto, { isArray: true })
  listForStudent(
    @CurrentScope() scope: Scope,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query() query: HomeworkQueryDto,
  ): Promise<HomeworkDto[]> {
    return this.homework.listForStudent(scope, studentId, query);
  }

  @Post(':id/submit/:studentId')
  @RequirePermission('homework.submit')
  @ApiData(HomeworkSubmissionDto)
  submit(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) homeworkId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Body() body: SubmitHomeworkDto,
  ): Promise<HomeworkSubmissionDto> {
    return this.homework.submit(user, scope, homeworkId, studentId, body);
  }

  @Get(':id/submission/:studentId')
  @RequirePermission('homework.view', 'homework.submit')
  @ApiData(HomeworkSubmissionDto)
  getStudentSubmission(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) homeworkId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ): Promise<HomeworkSubmissionDto | null> {
    return this.homework.getStudentSubmission(scope, homeworkId, studentId);
  }
}
