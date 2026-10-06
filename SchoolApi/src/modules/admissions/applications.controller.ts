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
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import type { PageResult } from '../../core/common/pagination/page-result';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { AttachDocumentDto } from '../documents/dto/document-input.dto';
import { DocumentDto } from '../documents/dto/document.dto';
import { AdmissionConfirmService } from './admission-confirm.service';
import { ApplicationAccessService } from './application-access.service';
import { ApplicationWorkflowService } from './application-workflow.service';
import { ApplicationsService } from './applications.service';
import {
  ApplicationInputDto,
  ApplicationQueryDto,
  ConfirmApplicationDto,
  DecideApplicationDto,
  ScheduleTestDto,
  TestResultDto,
  UpdateApplicationDto,
  WithdrawApplicationDto,
} from './dto/application-input.dto';
import { ApplicationDto, ConfirmedApplicationDto } from './dto/application.dto';

@ApiTags('admissions')
@ApiBearerAuth()
@Controller('admissions/applications')
export class ApplicationsController {
  constructor(
    private readonly applications: ApplicationsService,
    private readonly access: ApplicationAccessService,
    private readonly workflow: ApplicationWorkflowService,
    private readonly confirmation: AdmissionConfirmService,
  ) {}

  @Get()
  @RequirePermission('admissions.view')
  @ApiPage(ApplicationDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: ApplicationQueryDto,
  ): Promise<PageResult<ApplicationDto>> {
    return this.applications.list(scope, query);
  }

  @Post()
  @RequirePermission('admissions.add')
  @ApiData(ApplicationDto)
  async create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: ApplicationInputDto,
  ): Promise<ApplicationDto> {
    return this.access.toDto(await this.applications.create(user, scope, body));
  }

  @Get(':id')
  @RequirePermission('admissions.view')
  @ApiData(ApplicationDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApplicationDto> {
    return this.applications.get(scope, id);
  }

  @Patch(':id')
  @RequirePermission('admissions.edit')
  @ApiData(ApplicationDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateApplicationDto,
  ): Promise<ApplicationDto> {
    return this.applications.update(user, scope, id, body);
  }

  @Post(':id/documents')
  @RequirePermission('admissions.edit')
  @ApiData(DocumentDto)
  attach(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AttachDocumentDto,
  ): Promise<DocumentDto> {
    return this.applications.attachDocument(user, scope, id, body);
  }

  @Post(':id/test')
  @HttpCode(200)
  @RequirePermission('admissions.edit')
  @ApiData(ApplicationDto)
  scheduleTest(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ScheduleTestDto,
  ): Promise<ApplicationDto> {
    return this.workflow.scheduleTest(user, scope, id, body);
  }

  @Post(':id/test-result')
  @HttpCode(200)
  @RequirePermission('admissions.edit')
  @ApiData(ApplicationDto)
  testResult(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: TestResultDto,
  ): Promise<ApplicationDto> {
    return this.workflow.recordResult(user, scope, id, body);
  }

  @Post(':id/decide')
  @HttpCode(200)
  @RequirePermission('admissions.approve')
  @ApiData(ApplicationDto)
  decide(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DecideApplicationDto,
  ): Promise<ApplicationDto> {
    return this.workflow.decide(user, scope, id, body);
  }

  @Post(':id/confirm')
  @HttpCode(200)
  @RequirePermission('admissions.approve')
  @ApiData(ConfirmedApplicationDto)
  confirm(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ConfirmApplicationDto,
  ): Promise<ConfirmedApplicationDto> {
    return this.confirmation.confirm(user, scope, id, body);
  }

  @Post(':id/withdraw')
  @HttpCode(200)
  @RequirePermission('admissions.edit')
  @ApiData(ApplicationDto)
  withdraw(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: WithdrawApplicationDto,
  ): Promise<ApplicationDto> {
    return this.applications.withdraw(user, scope, id, body.reason);
  }
}
