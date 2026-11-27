import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

/** Wallets a parent can pick; must match the branch's `fees.onlineGateway`. */
export const ONLINE_GATEWAY_CHOICES = [
  'MANUAL',
  'JAZZCASH',
  'EASYPAISA',
] as const;
export type OnlineGatewayChoice = (typeof ONLINE_GATEWAY_CHOICES)[number];

export class InitiateOnlineDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  invoiceId!: string;

  /** The wallet the parent chose; refused when it is not the branch's gateway. */
  @ApiPropertyOptional({ enum: ONLINE_GATEWAY_CHOICES })
  @IsOptional()
  @IsIn(ONLINE_GATEWAY_CHOICES)
  gateway?: OnlineGatewayChoice;
}

export class InitiateOnlineResultDto {
  gateway!: string;
  redirectUrl!: string;
  @ApiPropertyOptional()
  formData?: Record<string, string>;
  @ApiPropertyOptional()
  onlinePaymentId?: string;
}

export class GatewayCallbackResultDto {
  received!: boolean;
  paymentId!: string;
  receiptNo!: string;
}

export class OnlinePaymentStatusDto {
  id!: string;
  gateway!: string;
  status!: string;
  amountMinor!: number;
  currency!: string;
  @ApiPropertyOptional()
  gatewayRef?: string | null;
  @ApiPropertyOptional()
  paymentId?: string | null;
  createdAt!: string;
}
