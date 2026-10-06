import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  PutSalaryStructureDto,
  SalaryStructuresDto,
} from './dto/salary-structure.dto';
import { SalaryStructureService } from './salary-structure.service';

@ApiTags('payroll')
@ApiBearerAuth()
@Controller('staff')
export class SalaryStructureController {
  constructor(private readonly structures: SalaryStructureService) {}

  @Get(':id/salary-structure')
  @RequirePermission('payroll.view')
  @ApiData(SalaryStructuresDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SalaryStructuresDto> {
    return this.structures.get(scope, id);
  }

  /** Appends a new structure row (history is never edited). */
  @Put(':id/salary-structure')
  @HttpCode(200)
  @RequirePermission('payroll.edit')
  @ApiData(SalaryStructuresDto)
  put(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: PutSalaryStructureDto,
  ): Promise<SalaryStructuresDto> {
    return this.structures.put(user, scope, id, body);
  }
}
