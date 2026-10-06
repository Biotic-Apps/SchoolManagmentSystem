import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { OkDto } from '../../core/common/dto/ok.dto';
import type { PageResult } from '../../core/common/pagination/page-result';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  CreateThreadDto,
  RecipientsQueryDto,
  SendMessageDto,
  ThreadMessagesQueryDto,
  ThreadQueryDto,
} from './dto/thread-input.dto';
import {
  MessageDto,
  MessageRecipientDto,
  ThreadDetailDto,
  ThreadDto,
} from './dto/thread.dto';
import { ThreadMessagesService } from './thread-messages.service';
import { ThreadsService } from './threads.service';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagingController {
  constructor(
    private readonly threads: ThreadsService,
    private readonly messages: ThreadMessagesService,
  ) {}

  @Get('recipients')
  @RequirePermission('messages.view')
  @ApiData(MessageRecipientDto, { isArray: true })
  recipients(
    @CurrentScope() scope: Scope,
    @Query() query: RecipientsQueryDto,
  ): Promise<MessageRecipientDto[]> {
    return this.threads.recipientsFor(scope, query.studentId);
  }

  @Get('threads')
  @RequirePermission('messages.view')
  @ApiPage(ThreadDto)
  list(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: ThreadQueryDto,
  ): Promise<PageResult<ThreadDto>> {
    return this.threads.list(user, scope, query);
  }

  @Post('threads')
  @RequirePermission('messages.add')
  @ApiData(ThreadDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateThreadDto,
  ): Promise<ThreadDto> {
    return this.threads.create(user, scope, body);
  }

  @Get('threads/:id')
  @RequirePermission('messages.view')
  @ApiData(ThreadDetailDto)
  detail(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ThreadMessagesQueryDto,
  ): Promise<ThreadDetailDto> {
    return this.messages.detail(user, scope, id, query);
  }

  @Post('threads/:id/messages')
  @RequirePermission('messages.add')
  @ApiData(MessageDto)
  post(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SendMessageDto,
  ): Promise<MessageDto> {
    return this.messages.post(user, scope, id, body);
  }

  @Post('threads/:id/read')
  @HttpCode(200)
  @RequirePermission('messages.view')
  @ApiData(OkDto)
  read(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OkDto> {
    return this.messages.markRead(user, scope, id);
  }
}
