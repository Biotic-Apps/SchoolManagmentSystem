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
  CompletenessQueryDto,
  CompletenessRowDto,
  MarkSheetDto,
  MarkSheetQueryDto,
  SaveMarksDto,
  SheetDecisionDto,
} from './dto/mark-sheet.dto';
import { MarkEntryService } from './mark-entry.service';
import { MarkReviewService } from './mark-review.service';
import { MarkSheetsService } from './mark-sheets.service';

@ApiTags('exams')
@ApiBearerAuth()
@Controller()
export class MarkSheetsController {
  constructor(
    private readonly sheets: MarkSheetsService,
    private readonly entry: MarkEntryService,
    private readonly review: MarkReviewService,
  ) {}

  @Get('exams/:id/mark-sheets')
  @RequirePermission('exams.view')
  @ApiData(MarkSheetDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: MarkSheetQueryDto,
  ): Promise<MarkSheetDto[]> {
    return this.sheets.list(scope, id, query);
  }

  @Get('exams/:id/completeness')
  @RequirePermission('exams.view')
  @ApiData(CompletenessRowDto, { isArray: true })
  completeness(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: CompletenessQueryDto,
  ): Promise<CompletenessRowDto[]> {
    return this.sheets.completeness(scope, id, query.branchId);
  }

  @Get('mark-sheets/:id')
  @RequirePermission('exams.view')
  @ApiData(MarkSheetDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MarkSheetDto> {
    return this.sheets.get(scope, id);
  }

  @Put('mark-sheets/:id')
  @RequirePermission('exams.edit')
  @ApiData(MarkSheetDto)
  save(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SaveMarksDto,
  ): Promise<MarkSheetDto> {
    return this.entry.save(user, scope, id, body);
  }

  @Post('mark-sheets/:id/submit')
  @HttpCode(200)
  @RequirePermission('exams.submit')
  @ApiData(MarkSheetDto)
  submit(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MarkSheetDto> {
    return this.review.submit(user, scope, id);
  }

  @Post('mark-sheets/:id/accept')
  @HttpCode(200)
  @RequirePermission('exams.approve')
  @ApiData(MarkSheetDto)
  accept(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SheetDecisionDto,
  ): Promise<MarkSheetDto> {
    return this.review.decide(user, scope, id, 'ACCEPTED', body.comment);
  }

  @Post('mark-sheets/:id/return')
  @HttpCode(200)
  @RequirePermission('exams.approve')
  @ApiData(MarkSheetDto)
  return(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SheetDecisionDto,
  ): Promise<MarkSheetDto> {
    return this.review.decide(user, scope, id, 'RETURNED', body.comment);
  }
}
