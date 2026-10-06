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
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  BookListDraftDto,
  BookListDto,
  BookListQueryDto,
  CommentDto,
} from '../dto/book-list.dto';
import { BookListsService } from './book-lists.service';

@ApiTags('syllabus')
@ApiBearerAuth()
@Controller('book-lists')
export class BookListsController {
  constructor(private readonly lists: BookListsService) {}

  @Get()
  @RequirePermission('syllabus.view')
  @ApiData(BookListDto, { isArray: true })
  list(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: BookListQueryDto,
  ): Promise<BookListDto[]> {
    return this.lists.list(user, scope, query);
  }

  @Put(':classId/draft')
  @RequirePermission('syllabus.edit')
  @ApiData(BookListDto)
  draft(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('classId', ParseUUIDPipe) classId: string,
    @Body() body: BookListDraftDto,
  ): Promise<BookListDto> {
    return this.lists.saveDraft(user, scope, classId, body);
  }

  @Get(':id/revisions')
  @RequirePermission('syllabus.view')
  @ApiData(BookListDto, { isArray: true })
  revisions(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookListDto[]> {
    return this.lists.revisions(user, scope, id);
  }

  @Post(':id/submit')
  @HttpCode(200)
  @RequirePermission('syllabus.edit')
  @ApiData(BookListDto)
  submit(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CommentDto,
  ): Promise<BookListDto> {
    return this.lists.submit(user, scope, id, body.comment);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermission('syllabus.approve')
  @ApiData(BookListDto)
  approve(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CommentDto,
  ): Promise<BookListDto> {
    return this.lists.approve(user, scope, id, body.comment);
  }

  @Post(':id/return')
  @HttpCode(200)
  @RequirePermission('syllabus.approve')
  @ApiData(BookListDto)
  returnList(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CommentDto,
  ): Promise<BookListDto> {
    return this.lists.returnList(user, scope, id, body.comment);
  }
}
