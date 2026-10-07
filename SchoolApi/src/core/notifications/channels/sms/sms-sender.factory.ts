import type { AppConfigService } from '../../../../config/app-config.service';
import { HttpSmsSender } from './http-sms-sender';
import type { SmsSender } from './sms-sender';
import { TwilioSmsSender } from './twilio-sms-sender';

/** The configured SMS provider, or null for SMS_DRIVER=log. */
export function createSmsSender(config: AppConfigService): SmsSender | null {
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
    default:
      return null;
  }
}
