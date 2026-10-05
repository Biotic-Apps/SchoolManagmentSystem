import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AllowPendingPassword } from '../../core/auth/guards/allow-pending-password.decorator';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { MeDto, MeUserDto } from './dto/me.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { MeService } from './me.service';

@ApiTags('me')
@ApiBearerAuth()
@AllowPendingPassword()
@Controller('me')
export class MeController {
  constructor(private readonly me: MeService) {}

  @Get()
  @ApiData(MeDto)
  get(@CurrentUser() user: AuthUser): Promise<MeDto> {
    return this.me.get(user);
  }

  @Patch()
  @ApiData(MeUserDto)
  update(
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateMeDto,
  ): Promise<MeUserDto> {
    return this.me.update(user, body);
  }
}
