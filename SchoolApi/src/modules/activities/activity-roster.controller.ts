import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { ConsentsService } from './consents/consents.service';
import {
  ConsentDecisionDto,
  ConsentItemDto,
  ConsentListDto,
} from './dto/consent.dto';
import { ParticipantsDto, ParticipantsInputDto } from './dto/participant.dto';
import { ParticipantsService } from './participants/participants.service';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities/:id')
export class ActivityRosterController {
  constructor(
    private readonly consents: ConsentsService,
    private readonly participants: ParticipantsService,
  ) {}

  @Get('consents')
  @RequirePermission('activities.view')
  @ApiData(ConsentListDto)
  listConsents(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ConsentListDto> {
    return this.consents.list(scope, id);
  }

  @Post('consents')
  @HttpCode(200)
  @RequirePermission('activities.view')
  @ApiData(ConsentItemDto)
  respond(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ConsentDecisionDto,
  ): Promise<ConsentItemDto> {
    return this.consents.respond(user, scope, id, body);
  }

  @Get('participants')
  @RequirePermission('activities.view')
  @ApiData(ParticipantsDto)
  listParticipants(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ParticipantsDto> {
    return this.participants.list(scope, id);
  }

  @Put('participants')
  @RequirePermission('activities.edit')
  @ApiData(ParticipantsDto)
  replaceParticipants(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ParticipantsInputDto,
  ): Promise<ParticipantsDto> {
    return this.participants.replace(user, scope, id, body);
  }
}
