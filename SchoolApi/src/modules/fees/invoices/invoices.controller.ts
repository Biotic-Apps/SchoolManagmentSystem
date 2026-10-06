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
import { InvoiceGenerationService } from '../generation/invoice-generation.service';
import {
  InvoiceDto,
  InvoiceIssueResultDto,
  InvoiceJobDto,
  InvoicePdfDto,
} from './dto/invoice.dto';
import {
  CancelInvoiceDto,
  CreateAdhocInvoiceDto,
  GenerateInvoicesDto,
  InvoiceQueryDto,
  IssueInvoicesDto,
} from './dto/invoice-input.dto';
import { InvoiceActionsService } from './invoice-actions.service';
import { InvoiceIssueService } from './invoice-issue.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { InvoiceReader } from './invoice-reader.service';

@ApiTags('fees')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly reader: InvoiceReader,
    private readonly generation: InvoiceGenerationService,
    private readonly issuing: InvoiceIssueService,
    private readonly actions: InvoiceActionsService,
    private readonly pdf: InvoicePdfService,
  ) {}

  @Post('generate')
  @HttpCode(200)
  @RequirePermission('fees.add')
  @ApiData(InvoiceJobDto)
  generate(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: GenerateInvoicesDto,
  ): Promise<InvoiceJobDto> {
    return this.generation.request(user, scope, body);
  }

  @Get()
  @RequirePermission('fees.view')
  @ApiPage(InvoiceDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: InvoiceQueryDto,
  ): Promise<PageResult<InvoiceDto>> {
    return this.reader.list(scope, query);
  }

  @Post('issue')
  @HttpCode(200)
  @RequirePermission('fees.approve')
  @ApiData(InvoiceIssueResultDto)
  issue(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: IssueInvoicesDto,
  ): Promise<InvoiceIssueResultDto> {
    return this.issuing.issue(user, scope, body.invoiceIds);
  }

  @Post()
  @RequirePermission('fees.add')
  @ApiData(InvoiceDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateAdhocInvoiceDto,
  ): Promise<InvoiceDto> {
    return this.actions.createAdhoc(user, scope, body);
  }

  @Get(':id')
  @RequirePermission('fees.view')
  @ApiData(InvoiceDto)
  async get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InvoiceDto> {
    const row = await this.reader.read(scope, id);
    return (await this.reader.toDtos([row]))[0];
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @RequirePermission('fees.edit')
  @ApiData(InvoiceDto)
  cancel(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CancelInvoiceDto,
  ): Promise<InvoiceDto> {
    return this.actions.cancel(user, scope, id, body);
  }

  @Get(':id/pdf')
  @RequirePermission('fees.view')
  @ApiData(InvoicePdfDto)
  challan(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InvoicePdfDto> {
    return this.pdf.request(user, scope, id);
  }
}
