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
import { IdCardJobDto, IdCardStatusDto } from './id-card.dto';
import { IdCardService } from './id-card.service';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students/:id/id-card')
export class IdCardController {
  constructor(private readonly cards: IdCardService) {}

  @Post()
  @HttpCode(200)
  @RequirePermission('students.view')
  @ApiData(IdCardJobDto)
  request(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IdCardJobDto> {
    return this.cards.request(user, scope, id);
  }

  @Get()
  @RequirePermission('students.view')
  @ApiData(IdCardStatusDto)
  status(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IdCardStatusDto> {
    return this.cards.status(scope, id);
  }
}
