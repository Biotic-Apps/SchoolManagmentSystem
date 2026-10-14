import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
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
import { ExamDto, JobIdDto } from '../exams/dto/exam.dto';
import {
  ReportCardQueryDto,
  ReportCardViewDto,
} from '../report-cards/report-card.dto';
import { ReportCardsService } from '../report-cards/report-cards.service';
import {
  ResultQueryDto,
  StudentResultDto,
  StudentResultsDto,
} from './dto/result.dto';
import { ResultApprovalService } from './result-approval.service';
import { ResultComputeService } from './result-compute.service';
import { ResultPublishService } from './result-publish.service';
import { ResultsQueryService } from './results-query.service';

@ApiTags('exams')
@ApiBearerAuth()
@Controller()
export class ResultsController {
  constructor(
    private readonly compute: ResultComputeService,
    private readonly approval: ResultApprovalService,
    private readonly publishing: ResultPublishService,
    private readonly query: ResultsQueryService,
    private readonly reportCards: ReportCardsService,
  ) {}

  @Post('exams/:id/compute')
  @HttpCode(200)
  @RequirePermission('exams.approve')
  @ApiData(JobIdDto)
  computeResults(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JobIdDto> {
    return this.compute.enqueue(user, scope, id);
  }

  @Post('exams/:id/approve-results')
  @HttpCode(200)
  @RequirePermission('exams.approve')
  @ApiData(ExamDto)
  approveResults(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ExamDto> {
    return this.approval.request(user, scope, id);
  }

  @Post('exams/:id/publish')
  @HttpCode(200)
  @RequirePermission('exams.publish')
  @ApiData(ExamDto)
  publish(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ExamDto> {
    return this.publishing.publish(user, scope, id);
  }

  @Get('results')
  @RequirePermission('exams.view')
  @ApiData(StudentResultDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: ResultQueryDto,
  ): Promise<StudentResultDto[]> {
    return this.query.list(scope, query);
  }

  @Get('students/:id/results')
  @RequirePermission('exams.view')
  @ApiData(StudentResultsDto)
  studentResults(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudentResultsDto> {
    return this.query.forStudent(scope, id);
  }

  @Get('students/:id/report-cards')
  @RequirePermission('exams.view')
  @ApiData(ReportCardViewDto)
  reportCard(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ReportCardQueryDto,
  ): Promise<ReportCardViewDto> {
    return this.reportCards.view(
      user,
      scope,
      id,
      query.examId,
      query.templateId,
    );
  }
}
