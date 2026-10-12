import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { NOTIFICATION_CATEGORIES } from '../../../core/notifications/notification-categories';

export class EmailSwitchDto {
  @ApiProperty() @IsBoolean() enabled!: boolean;

  @ApiProperty({ nullable: true, type: String, maxLength: 60 })
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(60)
  fromName!: string | null;
}

export class SmsSwitchDto {
  @ApiProperty() @IsBoolean() enabled!: boolean;

  @ApiProperty({ nullable: true, type: String, maxLength: 20 })
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(20)
  senderId!: string | null;
}

export class PushSwitchDto {
  @ApiProperty() @IsBoolean() enabled!: boolean;
}

export class CategoryChannelsDto {
  @ApiProperty({ enum: NOTIFICATION_CATEGORIES })
  @IsIn(NOTIFICATION_CATEGORIES)
  category!: string;

  @ApiProperty() @IsBoolean() email!: boolean;
  @ApiProperty() @IsBoolean() sms!: boolean;
  @ApiProperty() @IsBoolean() push!: boolean;
  @ApiProperty() @IsBoolean() whatsapp!: boolean;
  @ApiProperty() @IsBoolean() inApp!: boolean;
}

/** Response: every known category with its effective defaults. */
export class NotificationSettingsDto {
  @ApiProperty({ type: EmailSwitchDto }) email!: EmailSwitchDto;
  @ApiProperty({ type: SmsSwitchDto }) sms!: SmsSwitchDto;
  @ApiProperty({ type: PushSwitchDto }) push!: PushSwitchDto;
  @ApiProperty({ type: [CategoryChannelsDto] })
  categories!: CategoryChannelsDto[];
}

/** PATCH: top-level parts optional; listed categories replace their entry. */
export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({ type: EmailSwitchDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailSwitchDto)
  email?: EmailSwitchDto;

  @ApiPropertyOptional({ type: SmsSwitchDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SmsSwitchDto)
  sms?: SmsSwitchDto;

  @ApiPropertyOptional({ type: PushSwitchDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PushSwitchDto)
  push?: PushSwitchDto;

  @ApiPropertyOptional({ type: PushSwitchDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PushSwitchDto)
  whatsapp?: PushSwitchDto;

  @ApiPropertyOptional({ type: [CategoryChannelsDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(NOTIFICATION_CATEGORIES.length)
  @ValidateNested({ each: true })
  @Type(() => CategoryChannelsDto)
  categories?: CategoryChannelsDto[];
}
