import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class InitiateOnlineDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  invoiceId!: string;
}

export class InitiateOnlineResultDto {
  gateway!: string;
  redirectUrl!: string;
}

export class GatewayCallbackResultDto {
  received!: boolean;
  paymentId!: string;
  receiptNo!: string;
}
