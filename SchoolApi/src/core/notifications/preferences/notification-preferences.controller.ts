import { Body, Controller, Get, ParseArrayPipe, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiData } from '../../common/swagger/api-data.decorator';
import type { AuthUser } from '../../common/types/auth-user';
import {
  NotificationPreferenceDto,
  PreferenceInputDto,
} from './notification-preference.dto';
import { NotificationPreferencesService } from './notification-preferences.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications/preferences')
export class NotificationPreferencesController {
  constructor(private readonly preferences: NotificationPreferencesService) {}

  @Get()
  @ApiData(NotificationPreferenceDto, { isArray: true })
  list(@CurrentUser() user: AuthUser): Promise<NotificationPreferenceDto[]> {
    return this.preferences.list(user.id);
  }

  @Put()
  @ApiBody({ type: [PreferenceInputDto] })
  @ApiData(NotificationPreferenceDto, { isArray: true })
  update(
    @CurrentUser() user: AuthUser,
    @Body(new ParseArrayPipe({ items: PreferenceInputDto, whitelist: true }))
    body: PreferenceInputDto[],
  ): Promise<NotificationPreferenceDto[]> {
    return this.preferences.update(user.id, body);
  }
}
