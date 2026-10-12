import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

/** Returned by GET /sms-gateway/pending. */
export class PendingSmsDto {
  id!: string;
  to!: string;
  message!: string;
  senderId!: string | null;
  createdAt!: string;
}

/** Body for POST /sms-gateway/:id/ack. */
export class AckSmsDto {
  @IsEnum(['SENT', 'FAILED'])
  status!: 'SENT' | 'FAILED';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  error?: string;
}

/** Returned by GET /sms-gateway/status. */
export class GatewayStatusDto {
  enabled!: boolean;
  deviceId!: string | null;
  pending!: number;
  lastSentAt!: string | null;
}
