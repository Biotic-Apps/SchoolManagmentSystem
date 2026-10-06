import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
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
import { InvoiceJobDto } from '../invoices/dto/invoice.dto';
import { DueRemindersService } from './due-reminders.service';
import { DueRemindersDto, DuesQueryDto, DuesRowDto } from './dto/dues.dto';
import { DuesService } from './dues.service';

@ApiTags('fees')
@ApiBearerAuth()
@Controller('dues')
export class DuesController {
  constructor(
    private readonly dues: DuesService,
    private readonly reminders: DueRemindersService,
  ) {}

  @Get()
  @RequirePermission('fees.view')
  @ApiPage(DuesRowDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: DuesQueryDto,
  ): Promise<PageResult<DuesRowDto>> {
    return this.dues.list(scope, query);
  }

  @Post('reminders')
  @HttpCode(200)
  @RequirePermission('fees.edit')
  @ApiData(InvoiceJobDto)
  remind(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: DueRemindersDto,
  ): Promise<InvoiceJobDto> {
    return this.reminders.request(user, scope, body.studentIds);
  }
}
