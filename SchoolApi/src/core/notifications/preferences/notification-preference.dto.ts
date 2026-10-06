import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { NOTIFICATION_CATEGORIES } from '../notification-categories';

export class NotificationPreferenceDto {
  @ApiProperty({ enum: NOTIFICATION_CATEGORIES })
  category!: string;
  inApp!: boolean;
  push!: boolean;
  critical!: boolean;
}

export class PreferenceInputDto {
  @ApiProperty({ enum: NOTIFICATION_CATEGORIES })
  @IsIn(NOTIFICATION_CATEGORIES)
  category!: string;

  @IsBoolean()
  push!: boolean;

  @IsOptional()
  @IsBoolean()
  inApp?: boolean;
}
