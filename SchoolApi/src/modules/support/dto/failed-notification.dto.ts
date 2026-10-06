import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';

export const SUPPORT_CHANNELS = ['EMAIL', 'SMS', 'PUSH'] as const;
export type SupportChannel = (typeof SUPPORT_CHANNELS)[number];

/** List filters; resend-all takes the same body (paging ignored). */
export class FailedNotificationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @ApiPropertyOptional({ enum: SUPPORT_CHANNELS })
  @IsOptional()
  @IsIn(SUPPORT_CHANNELS)
  channel?: SupportChannel;

  @IsOptionalDateOnly()
  from?: string;

  @IsOptionalDateOnly()
  to?: string;
}

export class FailedRecipientDto {
  @ApiProperty({ format: 'uuid' }) userId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true, type: String, example: 'a*****@school.pk' })
  contact!: string | null;
}

export class FailedNotificationDto {
  @ApiProperty({ format: 'uuid', description: 'Delivery id' }) id!: string;
  @ApiProperty({ type: FailedRecipientDto }) recipient!: FailedRecipientDto;
  @ApiProperty({ enum: SUPPORT_CHANNELS }) channel!: string;
  @ApiProperty() category!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ enum: ['PENDING', 'SENT', 'FAILED', 'SKIPPED'] })
  status!: string;
  @ApiProperty() attempts!: number;
  @ApiProperty({ nullable: true, type: String }) lastError!: string | null;
  @ApiProperty({ format: 'date-time' }) at!: string;
}

export class ResendResultDto {
  @ApiProperty() resent!: number;
  @ApiProperty() failed!: number;
}
