import { Module } from '@nestjs/common';
import { SmsGatewayController } from './sms-gateway.controller';
import { SmsGatewayService } from './sms-gateway.service';

/** SMS Gateway: Android phone polls for outbound SMS and sends them. */
@Module({
  controllers: [SmsGatewayController],
  providers: [SmsGatewayService],
  exports: [SmsGatewayService],
})
export class SmsGatewayModule {}
