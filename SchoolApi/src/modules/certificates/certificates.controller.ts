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
import type { PageResult } from '../../core/common/pagination/page-result';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { CertificateIssueService } from './certificate-issue.service';
import { CertificateReviewService } from './certificate-review.service';
import { CertificatesService } from './certificates.service';
import {
  CertificateQueryDto,
  CertificateReasonDto,
  CreateCertificateDto,
  IssueCertificateDto,
} from './dto/certificate-input.dto';
import { CertificateDto } from './dto/certificate.dto';

@ApiTags('certificates')
@ApiBearerAuth()
@Controller('certificates')
export class CertificatesController {
  constructor(
    private readonly certificates: CertificatesService,
    private readonly review: CertificateReviewService,
    private readonly issuing: CertificateIssueService,
  ) {}

  @Post()
  @RequirePermission('certificates.add')
  @ApiData(CertificateDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateCertificateDto,
  ): Promise<CertificateDto> {
    return this.certificates.create(user, scope, body);
  }

  @Get()
  @RequirePermission('certificates.view')
  @ApiPage(CertificateDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: CertificateQueryDto,
  ): Promise<PageResult<CertificateDto>> {
    return this.certificates.list(scope, query);
  }

  @Get(':id')
  @RequirePermission('certificates.view')
  @ApiData(CertificateDto)
  get(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CertificateDto> {
    return this.certificates.get(user, scope, id);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermission('certificates.approve')
  @ApiData(CertificateDto)
  approve(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CertificateDto> {
    return this.review.approve(user, scope, id);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @RequirePermission('certificates.approve')
  @ApiData(CertificateDto)
  reject(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CertificateReasonDto,
  ): Promise<CertificateDto> {
    return this.review.reject(user, scope, id, body.reason);
  }

  @Post(':id/issue')
  @HttpCode(200)
  @RequirePermission('certificates.add')
  @ApiData(CertificateDto)
  issue(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: IssueCertificateDto,
  ): Promise<CertificateDto> {
    return this.issuing.issue(user, scope, id, body?.effectiveDate);
  }

  @Post(':id/reissue')
  @HttpCode(200)
  @RequirePermission('certificates.add')
  @ApiData(CertificateDto)
  reissue(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CertificateReasonDto,
  ): Promise<CertificateDto> {
    return this.issuing.reissue(user, scope, id, body.reason);
  }
}
