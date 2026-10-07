import type { Env } from '../../../../config/env.schema';
import { errorText, providerError } from '../provider-error';
import {
  responseText,
  SMS_TIMEOUT_MS,
  type OutgoingSms,
  type SmsSender,
} from './sms-sender';
import { escapeFor, fillTemplate, type TemplateValues } from './sms-template';

type HttpEnv = Pick<
  Env,
  'SMS_HTTP_URL' | 'SMS_HTTP_METHOD' | 'SMS_HTTP_HEADERS' | 'SMS_HTTP_BODY'
>;

const SECRET_NAME = /auth|key|token|secret|pass|sign/i;

const DEFAULT_BODY =
  '{"to":"{{to}}","message":"{{message}}","senderId":"{{senderId}}"}';

/**
 * SMS_DRIVER=http: any local gateway. Placeholders are filled in the URL
 * (URL-encoded) and the body (escaped for its Content-Type; GET sends no
 * body). Any 2xx answer is success.
 */
export class HttpSmsSender implements SmsSender {
  private readonly headers: Record<string, string>;
  /** Credentials in headers or the URL query, removed from error texts. */
  private readonly secrets: string[];

  constructor(private readonly env: HttpEnv) {
    const configured = env.SMS_HTTP_HEADERS ?? {};
    const hasType = Object.keys(configured).some(
      (name) => name.toLowerCase() === 'content-type',
    );
    this.headers =
      hasType || env.SMS_HTTP_BODY
        ? configured
        : { ...configured, 'Content-Type': 'application/json' };
    const query = [...new URL(env.SMS_HTTP_URL!).searchParams.entries()];
    this.secrets = [...Object.entries(configured), ...query]
      .filter(([name]) => SECRET_NAME.test(name))
      .map(([, value]) => value);
  }

  async send(sms: OutgoingSms): Promise<void> {
    const values: TemplateValues = {
      to: sms.to,
      message: sms.message,
      senderId: sms.senderId ?? '',
    };
    const method = this.env.SMS_HTTP_METHOD;
    const contentType = Object.entries(this.headers).find(
      ([name]) => name.toLowerCase() === 'content-type',
    )?.[1];
    const url = fillTemplate(
      this.env.SMS_HTTP_URL!,
      values,
      encodeURIComponent,
    );
    const body =
      method === 'GET'
        ? undefined
        : fillTemplate(
            this.env.SMS_HTTP_BODY ?? DEFAULT_BODY,
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
        signal: AbortSignal.timeout(SMS_TIMEOUT_MS),
      });
    } catch (error) {
      throw providerError(`SMS gateway: ${errorText(error)}`, secrets);
    }
    if (response.ok) return;
    const detail = await responseText(response);
    throw providerError(`SMS gateway ${response.status}: ${detail}`, secrets);
  }
}
