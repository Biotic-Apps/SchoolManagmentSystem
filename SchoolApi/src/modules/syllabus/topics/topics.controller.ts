import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { TopicProgressDto, TopicProgressResultDto } from '../dto/syllabus.dto';
import { TopicProgressService } from './topic-progress.service';

@ApiTags('syllabus')
@ApiBearerAuth()
@Controller('syllabus-topics')
export class TopicsController {
  constructor(private readonly progress: TopicProgressService) {}

  @Post(':id/progress')
  @HttpCode(200)
  @RequirePermission('syllabus.edit')
  @ApiData(TopicProgressResultDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: TopicProgressDto,
  ): Promise<TopicProgressResultDto> {
    return this.progress.update(user, scope, id, body);
  }
}
