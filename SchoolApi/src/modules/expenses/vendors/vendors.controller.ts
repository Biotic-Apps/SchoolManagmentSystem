import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  ApiData,
  ApiPage,
} from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { CreateVendorDto, VendorDto, VendorQueryDto } from './vendor.dto';
import { VendorsService } from './vendors.service';

@ApiTags('expenses')
@ApiBearerAuth()
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendors: VendorsService) {}

  @Get()
  @RequirePermission('expenses.view', 'inventory.view')
  @ApiPage(VendorDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: VendorQueryDto,
  ): Promise<PageResult<VendorDto>> {
    return this.vendors.list(scope, query);
  }

  @Post()
  @RequirePermission('expenses.add', 'inventory.add')
  @ApiData(VendorDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateVendorDto,
  ): Promise<VendorDto> {
    return this.vendors.create(user, scope, body);
  }
}
