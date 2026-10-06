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
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  CreateEarlyLeaveDto,
  DecisionCommentDto,
  EarlyLeaveDto,
  EarlyLeaveQueryDto,
} from '../dto/pickup.dto';
import { EarlyLeaveService } from './early-leave.service';

@ApiTags('pickup')
@ApiBearerAuth()
@Controller('early-leave')
export class EarlyLeaveController {
  constructor(private readonly leaves: EarlyLeaveService) {}

  @Post()
  @RequirePermission('pickup.add', 'pickup.view')
  @ApiData(EarlyLeaveDto)
  request(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateEarlyLeaveDto,
  ): Promise<EarlyLeaveDto> {
    return this.leaves.request(user, scope, body);
  }

  @Get()
  @RequirePermission('pickup.view')
  @ApiData(EarlyLeaveDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: EarlyLeaveQueryDto,
  ): Promise<EarlyLeaveDto[]> {
    return this.leaves.list(scope, query);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermission('pickup.view', 'pickup.approve')
  @ApiData(EarlyLeaveDto)
  approve(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DecisionCommentDto,
  ): Promise<EarlyLeaveDto> {
    return this.leaves.decide(user, scope, id, 'APPROVED', body.comment);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @RequirePermission('pickup.view', 'pickup.approve')
  @ApiData(EarlyLeaveDto)
  reject(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DecisionCommentDto,
  ): Promise<EarlyLeaveDto> {
    return this.leaves.decide(user, scope, id, 'REJECTED', body.comment);
  }
}
