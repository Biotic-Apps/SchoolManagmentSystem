import type { Env } from '../../../../config/env.schema';
import { errorText, providerError } from '../provider-error';
import {
  responseText,
  WHATSAPP_TIMEOUT_MS,
  type OutgoingWhatsApp,
  type WhatsAppSender,
} from './whatsapp-sender';

type TwilioWhatsAppEnv = Pick<
  Env,
  | 'WHATSAPP_TWILIO_ACCOUNT_SID'
  | 'WHATSAPP_TWILIO_AUTH_TOKEN'
  | 'WHATSAPP_TWILIO_FROM'
>;

/** Twilio's error body: `{ code, message }`. */
function twilioMessage(body: string): string {
  try {
    const json = JSON.parse(body) as { code?: number; message?: string };
    if (json.message) return `${json.code ?? ''} ${json.message}`.trim();
  } catch {
    // not JSON
  }
  return body;
}

/**
 * WHATSAPP_DRIVER=twilio: Twilio WhatsApp Business API.
 * Uses the same Messages API as SMS but with `whatsapp:` prefix on numbers.
 */
export class TwilioWhatsAppSender implements WhatsAppSender {
  constructor(private readonly env: TwilioWhatsAppEnv) {}

  async send(msg: OutgoingWhatsApp): Promise<void> {
    const sid = this.env.WHATSAPP_TWILIO_ACCOUNT_SID!;
    const token = this.env.WHATSAPP_TWILIO_AUTH_TOKEN!;
    const secrets = [token];
    let response: Response;
    try {
      response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: `whatsapp:${msg.to}`,
            From: `whatsapp:${this.env.WHATSAPP_TWILIO_FROM!}`,
            Body: msg.message,
          }),
          signal: AbortSignal.timeout(WHATSAPP_TIMEOUT_MS),
        },
      );
    } catch (error) {
      throw providerError(`Twilio WhatsApp: ${errorText(error)}`, secrets);
    }
    if (response.ok) return;
    const detail = twilioMessage(await responseText(response));
    throw providerError(
      `Twilio WhatsApp ${response.status}: ${detail}`,
      secrets,
    );
  }
}
