import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { CreateSlotsDto, MeetingSlotDto, SlotQueryDto } from '../dto/slot.dto';
import { SlotsService } from './slots.service';

@ApiTags('meetings')
@ApiBearerAuth()
@Controller('meetings/slots')
export class SlotsController {
  constructor(private readonly slots: SlotsService) {}

  @Get()
  @RequirePermission('meetings.view')
  @ApiData(MeetingSlotDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: SlotQueryDto,
  ): Promise<MeetingSlotDto[]> {
    return this.slots.list(scope, query);
  }

  @Post()
  @RequirePermission('meetings.add')
  @ApiData(MeetingSlotDto, { isArray: true })
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateSlotsDto,
  ): Promise<MeetingSlotDto[]> {
    return this.slots.create(user, scope, body);
  }

  @Delete(':id')
  @RequirePermission('meetings.add')
  @ApiData(MeetingSlotDto)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MeetingSlotDto> {
    return this.slots.remove(user, id);
  }
}
