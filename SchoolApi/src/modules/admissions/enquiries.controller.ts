import {
  Body,
  Controller,
  Get,
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
import { ApplicationDto } from './dto/application.dto';
import {
  ConvertEnquiryDto,
  CreateEnquiryDto,
  EnquiryDto,
  EnquiryQueryDto,
  UpdateEnquiryDto,
} from './dto/enquiry.dto';
import { EnquiriesService } from './enquiries.service';

@ApiTags('admissions')
@ApiBearerAuth()
@Controller('admissions/enquiries')
export class EnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Get()
  @RequirePermission('admissions.view')
  @ApiPage(EnquiryDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: EnquiryQueryDto,
  ): Promise<PageResult<EnquiryDto>> {
    return this.enquiries.list(scope, query);
  }

  @Post()
  @RequirePermission('admissions.add')
  @ApiData(EnquiryDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateEnquiryDto,
  ): Promise<EnquiryDto> {
    return this.enquiries.create(user, scope, body);
  }

  @Patch(':id')
  @RequirePermission('admissions.edit')
  @ApiData(EnquiryDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateEnquiryDto,
  ): Promise<EnquiryDto> {
    return this.enquiries.update(user, scope, id, body);
  }

  @Post(':id/convert')
  @RequirePermission('admissions.add')
  @ApiData(ApplicationDto)
  convert(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ConvertEnquiryDto,
  ): Promise<ApplicationDto> {
    return this.enquiries.convert(user, scope, id, body);
  }
}
