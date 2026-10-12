import {
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
import { StaffIdCardJobDto, StaffIdCardStatusDto } from './staff-id-card.dto';
import { StaffIdCardService } from './staff-id-card.service';

@ApiTags('staff')
@ApiBearerAuth()
@Controller('staff/:id/id-card')
export class StaffIdCardController {
  constructor(private readonly cards: StaffIdCardService) {}

  @Post()
  @HttpCode(200)
  @RequirePermission('staff.edit')
  @ApiData(StaffIdCardJobDto)
  request(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StaffIdCardJobDto> {
    return this.cards.request(user, scope, id);
  }

  @Get()
  @RequirePermission('staff.view')
  @ApiData(StaffIdCardStatusDto)
  status(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StaffIdCardStatusDto> {
    return this.cards.status(scope, id);
  }
}
