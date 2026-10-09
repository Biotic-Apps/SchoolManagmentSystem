import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../../core/common/types/auth-user';
import { RequirePermission } from '../../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../../core/rbac/scope/scope';
import { IdCardPrintDto, IdCardPrintJobDto } from './id-card-bulk.dto';
import { IdCardBulkService } from './id-card-bulk.service';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students/id-cards/print')
export class IdCardBulkController {
  constructor(private readonly bulk: IdCardBulkService) {}

  /** A4 sheets (10 cards each, cut marks) for a section or class. */
  @Post()
  @HttpCode(200)
  @RequirePermission('students.edit')
  @ApiData(IdCardPrintJobDto)
  print(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: IdCardPrintDto,
  ): Promise<IdCardPrintJobDto> {
    return this.bulk.request(user, scope, body);
  }
}
