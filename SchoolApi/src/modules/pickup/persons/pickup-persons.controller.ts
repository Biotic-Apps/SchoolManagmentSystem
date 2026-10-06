import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { AddPickupPersonDto, PickupPersonDto } from '../dto/pickup.dto';
import { PickupPersonsService } from './pickup-persons.service';

@ApiTags('pickup')
@ApiBearerAuth()
@Controller()
export class PickupPersonsController {
  constructor(private readonly persons: PickupPersonsService) {}

  @Get('students/:id/pickup-persons')
  @RequirePermission('pickup.view')
  @ApiData(PickupPersonDto, { isArray: true })
  list(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PickupPersonDto[]> {
    return this.persons.list(user, scope, id);
  }

  @Post('students/:id/pickup-persons')
  @RequirePermission('pickup.add')
  @ApiData(PickupPersonDto)
  add(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AddPickupPersonDto,
  ): Promise<PickupPersonDto> {
    return this.persons.add(user, scope, id, body);
  }

  @Post('pickup-persons/:id/verify')
  @HttpCode(200)
  @RequirePermission('pickup.edit')
  @ApiData(PickupPersonDto)
  verify(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PickupPersonDto> {
    return this.persons.verify(user, scope, id);
  }

  @Post('pickup-persons/:id/revoke')
  @HttpCode(200)
  @RequirePermission('pickup.edit')
  @ApiData(PickupPersonDto)
  revoke(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PickupPersonDto> {
    return this.persons.revoke(user, scope, id);
  }
}
