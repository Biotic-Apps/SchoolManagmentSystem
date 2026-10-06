import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
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
  CreateFeeHeadDto,
  FeeHeadDto,
  FeeHeadQueryDto,
} from './dto/fee-head.dto';
import {
  ArchiveFeePlanDto,
  CreateFeePlanDto,
  FeePlanDto,
  FeePlanQueryDto,
  UpdateFeePlanDto,
} from './dto/fee-plan.dto';
import { FeeHeadsService } from './fee-heads.service';
import { FeePlanArchiveService } from './fee-plan-archive.service';
import { FeePlanReader } from './fee-plan-reader.service';
import { FeePlansService } from './fee-plans.service';

@ApiTags('fees')
@ApiBearerAuth()
@Controller()
export class FeeStructureController {
  constructor(
    private readonly heads: FeeHeadsService,
    private readonly plans: FeePlansService,
    private readonly reader: FeePlanReader,
    private readonly archiver: FeePlanArchiveService,
  ) {}

  @Get('fee-heads')
  @RequirePermission('fees.view')
  @ApiData(FeeHeadDto, { isArray: true })
  listHeads(
    @CurrentScope() scope: Scope,
    @Query() query: FeeHeadQueryDto,
  ): Promise<FeeHeadDto[]> {
    return this.heads.list(scope, query);
  }

  @Post('fee-heads')
  @RequirePermission('fees.add')
  @ApiData(FeeHeadDto)
  createHead(
    @CurrentScope() scope: Scope,
    @Body() body: CreateFeeHeadDto,
  ): Promise<FeeHeadDto> {
    return this.heads.create(scope, body);
  }

  @Get('fee-plans')
  @RequirePermission('fees.view')
  @ApiData(FeePlanDto, { isArray: true })
  listPlans(
    @CurrentScope() scope: Scope,
    @Query() query: FeePlanQueryDto,
  ): Promise<FeePlanDto[]> {
    return this.reader.list(scope, query);
  }

  @Post('fee-plans')
  @RequirePermission('fees.add')
  @ApiData(FeePlanDto)
  createPlan(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateFeePlanDto,
  ): Promise<FeePlanDto> {
    return this.plans.create(user, scope, body);
  }

  @Patch('fee-plans/:id')
  @RequirePermission('fees.edit')
  @ApiData(FeePlanDto)
  updatePlan(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateFeePlanDto,
  ): Promise<FeePlanDto> {
    return this.plans.update(user, scope, id, body);
  }

  @Post('fee-plans/:id/approve')
  @HttpCode(200)
  @RequirePermission('fees.approve')
  @ApiData(FeePlanDto)
  approvePlan(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FeePlanDto> {
    return this.plans.approve(user, scope, id);
  }

  @Post('fee-plans/:id/archive')
  @HttpCode(200)
  @RequirePermission('fees.edit', 'fees.approve')
  @ApiData(FeePlanDto)
  archivePlan(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ArchiveFeePlanDto,
  ): Promise<FeePlanDto> {
    return this.archiver.archive(user, scope, id, body.reason);
  }
}
