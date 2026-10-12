import type { AppConfigService } from '../../../../config/app-config.service';
import { HttpWhatsAppSender } from './http-whatsapp-sender';
import type { WhatsAppSender } from './whatsapp-sender';
import { TwilioWhatsAppSender } from './twilio-whatsapp-sender';

/** The configured WhatsApp provider, or null for WHATSAPP_DRIVER=log. */
export function createWhatsAppSender(
  config: AppConfigService,
): WhatsAppSender | null {
  switch (config.get('WHATSAPP_DRIVER')) {
    case 'twilio':
      return new TwilioWhatsAppSender({
        WHATSAPP_TWILIO_ACCOUNT_SID: config.get('WHATSAPP_TWILIO_ACCOUNT_SID'),
        WHATSAPP_TWILIO_AUTH_TOKEN: config.get('WHATSAPP_TWILIO_AUTH_TOKEN'),
        WHATSAPP_TWILIO_FROM: config.get('WHATSAPP_TWILIO_FROM'),
      });
    case 'http':
      return new HttpWhatsAppSender({
        WHATSAPP_HTTP_URL: config.get('WHATSAPP_HTTP_URL'),
        WHATSAPP_HTTP_METHOD: config.get('WHATSAPP_HTTP_METHOD'),
        WHATSAPP_HTTP_HEADERS: config.get('WHATSAPP_HTTP_HEADERS'),
        WHATSAPP_HTTP_BODY: config.get('WHATSAPP_HTTP_BODY'),
      });
    default:
      return null;
  }
}
