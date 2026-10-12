import type { Env } from '../../../../config/env.schema';
import { errorText, providerError } from '../provider-error';
import { escapeFor, fillTemplate, type TemplateValues } from '../sms/sms-template';
import {
  responseText,
  WHATSAPP_TIMEOUT_MS,
  type OutgoingWhatsApp,
  type WhatsAppSender,
} from './whatsapp-sender';

type HttpWhatsAppEnv = Pick<
  Env,
  | 'WHATSAPP_HTTP_URL'
  | 'WHATSAPP_HTTP_METHOD'
  | 'WHATSAPP_HTTP_HEADERS'
  | 'WHATSAPP_HTTP_BODY'
>;

const SECRET_NAME = /auth|key|token|secret|pass|sign/i;

const DEFAULT_BODY = '{"to":"{{to}}","message":"{{message}}"}';

/**
 * WHATSAPP_DRIVER=http: any WhatsApp Business API gateway (360dialog, WATI, etc.).
 * Placeholders are filled in the URL (URL-encoded) and the body (escaped for
 * its Content-Type). Any 2xx answer is success.
 */
export class HttpWhatsAppSender implements WhatsAppSender {
  private readonly headers: Record<string, string>;
  private readonly secrets: string[];

  constructor(private readonly env: HttpWhatsAppEnv) {
    const configured = env.WHATSAPP_HTTP_HEADERS ?? {};
    const hasType = Object.keys(configured).some(
      (name) => name.toLowerCase() === 'content-type',
    );
    this.headers =
      hasType || env.WHATSAPP_HTTP_BODY
        ? configured
        : { ...configured, 'Content-Type': 'application/json' };
    const query = [...new URL(env.WHATSAPP_HTTP_URL!).searchParams.entries()];
    this.secrets = [...Object.entries(configured), ...query]
      .filter(([name]) => SECRET_NAME.test(name))
      .map(([, value]) => value);
  }

  async send(msg: OutgoingWhatsApp): Promise<void> {
    const values: TemplateValues = {
      to: msg.to,
      message: msg.message,
      senderId: '',
    };
    const method = this.env.WHATSAPP_HTTP_METHOD;
    const contentType = Object.entries(this.headers).find(
      ([name]) => name.toLowerCase() === 'content-type',
    )?.[1];
    const url = fillTemplate(
      this.env.WHATSAPP_HTTP_URL!,
      values,
      encodeURIComponent,
    );
    const body = fillTemplate(
      this.env.WHATSAPP_HTTP_BODY ?? DEFAULT_BODY,
      values,
      escapeFor(contentType),
    );
    const secrets = this.secrets;
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: this.headers,
        body,
        signal: AbortSignal.timeout(WHATSAPP_TIMEOUT_MS),
      });
    } catch (error) {
      throw providerError(
        `WhatsApp gateway: ${errorText(error)}`,
        secrets,
      );
    }
    if (response.ok) return;
    const detail = await responseText(response);
    throw providerError(
      `WhatsApp gateway ${response.status}: ${detail}`,
      secrets,
    );
  }
}
