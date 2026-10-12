import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class InitiateOnlineDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  invoiceId!: string;
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
