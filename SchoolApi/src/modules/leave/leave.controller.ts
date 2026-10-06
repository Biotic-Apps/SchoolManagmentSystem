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
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  CreateLeaveDto,
  LeaveDecisionDto,
  LeaveDto,
  LeaveQueryDto,
} from './dto/leave.dto';
import { LeaveReviewService } from './leave-review.service';
import { LeaveService } from './leave.service';

@ApiTags('leave')
@ApiBearerAuth()
@Controller('leave')
export class LeaveController {
  constructor(
    private readonly leave: LeaveService,
    private readonly review: LeaveReviewService,
  ) {}

  @Post()
  @ApiData(LeaveDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateLeaveDto,
  ): Promise<LeaveDto> {
    return this.leave.create(user, scope, body);
  }

  @Get()
  @ApiData(LeaveDto, { isArray: true })
  list(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: LeaveQueryDto,
  ): Promise<LeaveDto[]> {
    return this.review.list(user, scope, query);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @ApiData(LeaveDto)
  approve(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: LeaveDecisionDto,
  ): Promise<LeaveDto> {
    return this.review.decide(user, scope, id, 'APPROVED', body.comment);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @ApiData(LeaveDto)
  reject(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: LeaveDecisionDto,
  ): Promise<LeaveDto> {
    return this.review.decide(user, scope, id, 'REJECTED', body.comment);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiData(LeaveDto)
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LeaveDto> {
    return this.leave.cancel(user, id);
  }
}
