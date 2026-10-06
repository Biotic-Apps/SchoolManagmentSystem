import {
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
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { toApplicationDto } from './application.mapper';
import { ApplicationWorkflowService } from './application-workflow.service';
import { ApplicationsRepository } from './applications.repository';
import { WaitlistQueryDto } from './dto/application-input.dto';
import { ApplicationDto } from './dto/application.dto';

@ApiTags('admissions')
@ApiBearerAuth()
@Controller('admissions/waiting-list')
export class WaitingListController {
  constructor(
    private readonly repository: ApplicationsRepository,
    private readonly workflow: ApplicationWorkflowService,
  ) {}

  @Get()
  @RequirePermission('admissions.view')
  @ApiData(ApplicationDto, { isArray: true })
  async list(
    @CurrentScope() scope: Scope,
    @Query() query: WaitlistQueryDto,
  ): Promise<ApplicationDto[]> {
    const rows = await this.repository.waitlist(scope, query);
    return rows.map((row) => toApplicationDto(row, []));
  }

  @Post(':applicationId/offer')
  @HttpCode(200)
  @RequirePermission('admissions.approve')
  @ApiData(ApplicationDto)
  offer(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('applicationId', ParseUUIDPipe) id: string,
  ): Promise<ApplicationDto> {
    return this.workflow.offerFromWaitlist(user, scope, id);
  }
}
