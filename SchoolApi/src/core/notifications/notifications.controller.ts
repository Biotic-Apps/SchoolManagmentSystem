import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CountDto } from '../common/dto/count.dto';
import { OK, OkDto } from '../common/dto/ok.dto';
import type { PageResult } from '../common/pagination/page-result';
import { ApiData, ApiPage } from '../common/swagger/api-data.decorator';
import type { AuthUser } from '../common/types/auth-user';
import { NotificationDto } from './dto/notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { NotificationInboxService } from './notification-inbox.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller()
export class NotificationsController {
  constructor(private readonly inbox: NotificationInboxService) {}

  @Get('notifications')
  @ApiPage(NotificationDto)
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: NotificationQueryDto,
  ): Promise<PageResult<NotificationDto>> {
    return this.inbox.list(user.id, query);
  }

  @Get('notifications/unread-count')
  @ApiData(CountDto)
  async unreadCount(@CurrentUser() user: AuthUser): Promise<CountDto> {
    return { count: await this.inbox.unreadCount(user.id) };
  }

  @Post('notifications/read-all')
  @HttpCode(200)
  @ApiData(OkDto)
  async readAll(@CurrentUser() user: AuthUser): Promise<OkDto> {
    await this.inbox.markAllRead(user.id);
    return OK;
  }

  @Post('notifications/:id/read')
  @HttpCode(200)
  @ApiData(OkDto)
  async read(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OkDto> {
    await this.inbox.markRead(user.id, id);
    return OK;
  }

  @Post('devices')
  @HttpCode(200)
  @ApiData(OkDto)
  async registerDevice(
    @CurrentUser() user: AuthUser,
    @Body() body: RegisterDeviceDto,
  ): Promise<OkDto> {
    await this.inbox.registerDevice(user.id, body.token, body.platform);
    return OK;
  }
}
