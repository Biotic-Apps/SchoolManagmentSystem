import {
  Body,
  Controller,
  Delete,
  Get,
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
  CreateQuestionDto,
  QuestionDto,
  QuestionQueryDto,
  UpdateQuestionDto,
} from './dto/question.dto';
import { QuestionsService } from './questions.service';

@ApiTags('questions')
@ApiBearerAuth()
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  @Get()
  @RequirePermission('questions.view')
  @ApiPage(QuestionDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: QuestionQueryDto,
  ): Promise<PageResult<QuestionDto>> {
    return this.questions.list(scope, query);
  }

  @Post()
  @RequirePermission('questions.add')
  @ApiData(QuestionDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateQuestionDto,
  ): Promise<QuestionDto> {
    return this.questions.create(user, scope, body);
  }

  @Get(':id')
  @RequirePermission('questions.view')
  @ApiData(QuestionDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<QuestionDto> {
    return this.questions.get(scope, id);
  }

  @Patch(':id')
  @RequirePermission('questions.edit')
  @ApiData(QuestionDto)
  update(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateQuestionDto,
  ): Promise<QuestionDto> {
    return this.questions.update(scope, id, body);
  }

  @Delete(':id')
  @RequirePermission('questions.delete')
  @ApiData(QuestionDto)
  archive(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<QuestionDto> {
    return this.questions.archive(scope, id);
  }
}
