import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  CreateSiblingDiscountDto,
  SiblingDiscountDto,
  UpdateSiblingDiscountDto,
} from './dto/sibling-discount.dto';
import { SiblingDiscountsService } from './sibling-discounts.service';

@ApiTags('fees')
@ApiBearerAuth()
@Controller('sibling-discounts')
export class SiblingDiscountsController {
  constructor(private readonly service: SiblingDiscountsService) {}

  @Get()
  @RequirePermission('fees.view')
  @ApiData(SiblingDiscountDto, { isArray: true })
  list(@CurrentScope() scope: Scope): Promise<SiblingDiscountDto[]> {
    return this.service.list(scope);
  }

  @Post()
  @RequirePermission('fees.add')
  @ApiData(SiblingDiscountDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateSiblingDiscountDto,
  ): Promise<SiblingDiscountDto> {
    return this.service.create(user, scope, body);
  }

  @Patch(':id')
  @RequirePermission('fees.edit')
  @ApiData(SiblingDiscountDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateSiblingDiscountDto,
  ): Promise<SiblingDiscountDto> {
    return this.service.update(user, scope, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermission('fees.edit')
  remove(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.service.remove(user, scope, id);
  }
}
