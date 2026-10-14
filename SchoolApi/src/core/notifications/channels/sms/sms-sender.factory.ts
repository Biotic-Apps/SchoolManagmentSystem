import type { AppConfigService } from '../../../../config/app-config.service';
import type { PrismaService } from '../../../prisma/prisma.service';
import { AndroidRelaySmsSender } from './android-relay-sms-sender';
import { HttpSmsSender } from './http-sms-sender';
import type { SmsSender } from './sms-sender';
import { TwilioSmsSender } from './twilio-sms-sender';

/** The configured SMS provider, or null for SMS_DRIVER=log. */
export function createSmsSender(
  config: AppConfigService,
  prisma?: PrismaService,
): SmsSender | null {
  switch (config.get('SMS_DRIVER')) {
    case 'twilio':
      return new TwilioSmsSender({
        TWILIO_ACCOUNT_SID: config.get('TWILIO_ACCOUNT_SID'),
        TWILIO_AUTH_TOKEN: config.get('TWILIO_AUTH_TOKEN'),
        TWILIO_FROM: config.get('TWILIO_FROM'),
      });
    case 'http':
      return new HttpSmsSender({
        SMS_HTTP_URL: config.get('SMS_HTTP_URL'),
        SMS_HTTP_METHOD: config.get('SMS_HTTP_METHOD'),
        SMS_HTTP_HEADERS: config.get('SMS_HTTP_HEADERS'),
        SMS_HTTP_BODY: config.get('SMS_HTTP_BODY'),
      });
    case 'android-relay':
      if (!prisma)
        throw new Error('PrismaService required for android-relay SMS driver');
      return new AndroidRelaySmsSender(prisma);
    default:
      return null;
  }
}
