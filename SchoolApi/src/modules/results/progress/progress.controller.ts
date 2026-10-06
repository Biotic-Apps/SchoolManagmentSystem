import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  CreateProgressNoteDto,
  HomeworkCompletionDto,
  HomeworkCompletionQueryDto,
  HomeworkStatusDto,
  ProgressNoteDto,
  ProgressNoteResultDto,
  SaveHomeworkStatusDto,
} from './dto/progress.dto';
import { HomeworkService } from './homework.service';
import { ProgressNotesService } from './progress-notes.service';

@ApiTags('progress')
@ApiBearerAuth()
@Controller()
export class ProgressController {
  constructor(
    private readonly notes: ProgressNotesService,
    private readonly homework: HomeworkService,
  ) {}

  @Get('students/:id/progress-notes')
  @RequirePermission('progress.view')
  @ApiData(ProgressNoteDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProgressNoteDto[]> {
    return this.notes.list(scope, id);
  }

  @Post('students/:id/progress-notes')
  @RequirePermission('progress.edit')
  @ApiData(ProgressNoteResultDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateProgressNoteDto,
  ): Promise<ProgressNoteResultDto> {
    return this.notes.create(user, scope, id, body);
  }

  @Get('students/:id/homework-completion')
  @RequirePermission('progress.view')
  @ApiData(HomeworkCompletionDto)
  completion(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: HomeworkCompletionQueryDto,
  ): Promise<HomeworkCompletionDto> {
    return this.homework.completion(scope, id, query);
  }

  @Put('diary/:id/homework-status')
  @RequirePermission('progress.edit')
  @ApiData(HomeworkStatusDto)
  saveHomework(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SaveHomeworkStatusDto,
  ): Promise<HomeworkStatusDto> {
    return this.homework.save(user, scope, id, body);
  }
}
