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
import {
  AcceptTransferDto,
  RequestTransferDto,
  TransferQueryDto,
  TransferReasonDto,
} from './dto/transfer-input.dto';
import { TransferDto } from './dto/transfer.dto';
import { TransfersService } from './transfers.service';

@ApiTags('students')
@ApiBearerAuth()
@Controller()
export class TransfersController {
  constructor(private readonly transfers: TransfersService) {}

  @Post('students/:id/transfers')
  @RequirePermission('students.edit')
  @ApiData(TransferDto)
  request(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RequestTransferDto,
  ): Promise<TransferDto> {
    return this.transfers.request(user, scope, id, body);
  }

  @Get('transfers')
  @RequirePermission('students.view')
  @ApiPage(TransferDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: TransferQueryDto,
  ): Promise<PageResult<TransferDto>> {
    return this.transfers.list(scope, query);
  }

  @Post('transfers/:id/accept')
  @HttpCode(200)
  @RequirePermission('students.edit')
  @ApiData(TransferDto)
  accept(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AcceptTransferDto,
  ): Promise<TransferDto> {
    return this.transfers.accept(user, scope, id, body.sectionId);
  }

  @Post('transfers/:id/reject')
  @HttpCode(200)
  @RequirePermission('students.edit')
  @ApiData(TransferDto)
  reject(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: TransferReasonDto,
  ): Promise<TransferDto> {
    return this.transfers.reject(user, scope, id, body.reason);
  }

  @Post('transfers/:id/cancel')
  @HttpCode(200)
  @RequirePermission('students.edit')
  @ApiData(TransferDto)
  cancel(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: TransferReasonDto,
  ): Promise<TransferDto> {
    return this.transfers.cancel(user, scope, id, body.reason);
  }
}
