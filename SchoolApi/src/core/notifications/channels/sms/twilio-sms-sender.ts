import type { Env } from '../../../../config/env.schema';
import { errorText, providerError } from '../provider-error';
import {
  responseText,
  SMS_TIMEOUT_MS,
  type OutgoingSms,
  type SmsSender,
} from './sms-sender';

type TwilioEnv = Pick<
  Env,
  'TWILIO_ACCOUNT_SID' | 'TWILIO_AUTH_TOKEN' | 'TWILIO_FROM'
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

/** SMS_DRIVER=twilio: Messages API with basic auth (plain fetch, no SDK). */
export class TwilioSmsSender implements SmsSender {
  constructor(private readonly env: TwilioEnv) {}

  async send(sms: OutgoingSms): Promise<void> {
    const sid = this.env.TWILIO_ACCOUNT_SID!;
    const token = this.env.TWILIO_AUTH_TOKEN!;
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
            To: sms.to,
            From: this.env.TWILIO_FROM!,
            Body: sms.message,
          }),
          signal: AbortSignal.timeout(SMS_TIMEOUT_MS),
        },
      );
    } catch (error) {
      throw providerError(`Twilio: ${errorText(error)}`, secrets);
    }
    if (response.ok) return;
    const detail = twilioMessage(await responseText(response));
    throw providerError(`Twilio ${response.status}: ${detail}`, secrets);
  }
}
