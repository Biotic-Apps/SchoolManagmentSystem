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
  CreateProofDto,
  ProofDto,
  ProofQueryDto,
  RejectProofDto,
  VerifyProofDto,
} from './dto/proof.dto';
import { ProofReviewService } from './proof-review.service';
import { ProofSubmitService } from './proof-submit.service';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payment-proofs')
export class ProofsController {
  constructor(
    private readonly submits: ProofSubmitService,
    private readonly reviews: ProofReviewService,
  ) {}

  @Post()
  @RequirePermission('fees.add')
  @ApiData(ProofDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateProofDto,
  ): Promise<ProofDto> {
    return this.submits.submit(user, scope, body);
  }

  @Get()
  @RequirePermission('fees.view')
  @ApiPage(ProofDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: ProofQueryDto,
  ): Promise<PageResult<ProofDto>> {
    return this.reviews.list(scope, query);
  }

  @Post(':id/verify')
  @HttpCode(200)
  @RequirePermission('fees.approve')
  @ApiData(ProofDto)
  verify(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: VerifyProofDto,
  ): Promise<ProofDto> {
    return this.reviews.verify(user, scope, id, body);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @RequirePermission('fees.approve')
  @ApiData(ProofDto)
  reject(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RejectProofDto,
  ): Promise<ProofDto> {
    return this.reviews.reject(user, scope, id, body.reason);
  }
}
