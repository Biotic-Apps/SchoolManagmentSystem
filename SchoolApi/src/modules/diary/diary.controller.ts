import {
  Body,
  Controller,
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
import { DiaryMissingService } from './diary-missing.service';
import { DiaryPublishService } from './diary-publish.service';
import { DiaryService } from './diary.service';
import {
  DiaryEntryDto,
  DiaryQueryDto,
  MissingDiaryDto,
  MissingDiaryQueryDto,
  PublishDiaryDto,
  ReturnDiaryDto,
  SaveDiaryDto,
} from './dto/diary.dto';

@ApiTags('diary')
@ApiBearerAuth()
@Controller('diary')
export class DiaryController {
  constructor(
    private readonly diary: DiaryService,
    private readonly publishing: DiaryPublishService,
    private readonly missingDiaries: DiaryMissingService,
  ) {}

  @Get()
  @RequirePermission('diary.view')
  @ApiData(DiaryEntryDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: DiaryQueryDto,
  ): Promise<DiaryEntryDto[]> {
    return this.diary.list(scope, query);
  }

  @Put()
  @RequirePermission('diary.edit')
  @ApiData(DiaryEntryDto)
  save(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: SaveDiaryDto,
  ): Promise<DiaryEntryDto> {
    return this.diary.save(user, scope, body);
  }

  @Get('missing')
  @RequirePermission('diary.view')
  @ApiData(MissingDiaryDto, { isArray: true })
  missing(
    @CurrentScope() scope: Scope,
    @Query() query: MissingDiaryQueryDto,
  ): Promise<MissingDiaryDto[]> {
    return this.missingDiaries.forScope(scope, query.branchId, query.date);
  }

  @Post(':id/publish')
  @HttpCode(200)
  @RequirePermission('diary.publish')
  @ApiData(DiaryEntryDto)
  publish(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: PublishDiaryDto,
  ): Promise<DiaryEntryDto> {
    return this.publishing.publish(user, scope, id, body.clientRequestId);
  }

  @Post(':id/return')
  @HttpCode(200)
  @RequirePermission('diary.approve')
  @ApiData(DiaryEntryDto)
  return(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ReturnDiaryDto,
  ): Promise<DiaryEntryDto> {
    return this.publishing.return(user, scope, id, body.comment);
  }
}
