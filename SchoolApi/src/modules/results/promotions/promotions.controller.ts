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
import { JobIdDto } from '../exams/dto/exam.dto';
import {
  ApplyPromotionsDto,
  ApplyPromotionsResultDto,
  ConfirmPromotionsDto,
  ConfirmPromotionsResultDto,
  PromotionQueryDto,
  PromotionRowDto,
  SuggestPromotionsDto,
  UpdatePromotionDto,
} from './dto/promotion.dto';
import { PromotionApplyService } from './promotion-apply.service';
import { PromotionConfirmService } from './promotion-confirm.service';
import { PromotionsService } from './promotions.service';

@ApiTags('exams')
@ApiBearerAuth()
@Controller('promotions')
export class PromotionsController {
  constructor(
    private readonly promotions: PromotionsService,
    private readonly confirming: PromotionConfirmService,
    private readonly applying: PromotionApplyService,
  ) {}

  @Post('suggest')
  @HttpCode(200)
  @RequirePermission('exams.approve')
  @ApiData(JobIdDto)
  suggest(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: SuggestPromotionsDto,
  ): Promise<JobIdDto> {
    return this.promotions.suggest(user, scope, body);
  }

  @Get()
  @RequirePermission('exams.view')
  @ApiData(PromotionRowDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: PromotionQueryDto,
  ): Promise<PromotionRowDto[]> {
    return this.promotions.list(scope, query);
  }

  @Patch(':id')
  @RequirePermission('exams.approve')
  @ApiData(PromotionRowDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePromotionDto,
  ): Promise<PromotionRowDto> {
    return this.promotions.update(user, scope, id, body);
  }

  @Post('confirm')
  @HttpCode(200)
  @RequirePermission('exams.approve')
  @ApiData(ConfirmPromotionsResultDto)
  confirm(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: ConfirmPromotionsDto,
  ): Promise<ConfirmPromotionsResultDto> {
    return this.confirming.confirm(user, scope, body);
  }

  @Post('apply')
  @HttpCode(200)
  @RequirePermission('exams.approve')
  @ApiData(ApplyPromotionsResultDto)
  apply(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: ApplyPromotionsDto,
  ): Promise<ApplyPromotionsResultDto> {
    return this.applying.apply(user, scope, body);
  }
}
