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
import { BranchScopedQueryDto } from '../dto/branch-scoped-query.dto';
import { CreateRoomDto } from '../dto/create-room.dto';
import { RoomDto } from '../dto/room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { RoomsService } from './rooms.service';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Get()
  @RequirePermission('classes.view')
  @ApiPage(RoomDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: BranchScopedQueryDto,
  ): Promise<PageResult<RoomDto>> {
    return this.rooms.list(scope, query);
  }

  @Post()
  @RequirePermission('classes.add', 'timetable.edit')
  @ApiData(RoomDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateRoomDto,
  ): Promise<RoomDto> {
    return this.rooms.create(user, scope, body);
  }

  @Patch(':id')
  @RequirePermission('classes.edit')
  @ApiData(RoomDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateRoomDto,
  ): Promise<RoomDto> {
    return this.rooms.update(user, scope, id, body);
  }
}
