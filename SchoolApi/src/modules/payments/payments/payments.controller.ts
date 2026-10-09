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
import { ReceiptQueryDto } from '../receipts/dto/receipt-query.dto';
import { ReceiptsService } from '../receipts/receipts.service';
import { ReversePaymentDto } from '../reversal/dto/reverse-payment.dto';
import { PaymentReversalService } from '../reversal/payment-reversal.service';
import { CreatePaymentDto, PaymentDto, ReceiptJobDto } from './dto/payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { PaymentQueryService } from './payment-query.service';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly queries: PaymentQueryService,
    private readonly receipts: ReceiptsService,
    private readonly reversals: PaymentReversalService,
  ) {}

  @Post()
  @RequirePermission('fees.add')
  @ApiData(PaymentDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreatePaymentDto,
  ): Promise<PaymentDto> {
    return this.payments.create(user, scope, body);
  }

  @Get()
  @RequirePermission('fees.view')
  @ApiPage(PaymentDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: PaymentQueryDto,
  ): Promise<PageResult<PaymentDto>> {
    return this.queries.list(scope, query);
  }

  @Get(':id')
  @RequirePermission('fees.view')
  @ApiData(PaymentDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentDto> {
    return this.queries.get(scope, id);
  }

  @Get(':id/receipt')
  @RequirePermission('fees.view')
  @ApiData(ReceiptJobDto)
  receipt(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ReceiptQueryDto,
  ): Promise<ReceiptJobDto> {
    return this.receipts.receipt(user, scope, id, query.format);
  }

  @Post(':id/reverse')
  @HttpCode(200)
  @RequirePermission('fees.edit')
  @ApiData(PaymentDto)
  reverse(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ReversePaymentDto,
  ): Promise<PaymentDto> {
    return this.reversals.request(user, scope, id, body.reason);
  }
}
