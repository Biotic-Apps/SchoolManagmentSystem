export interface OutgoingSms {
  /** E.164 number. */
  to: string;
  message: string;
  /** School sender id (`notifications.sms.senderId`). */
  senderId?: string | null;
}

/** A real SMS provider. Throws a sanitised error on failure. */
export interface SmsSender {
  send(sms: OutgoingSms): Promise<void>;
}

export const SMS_TIMEOUT_MS = 15_000;

/** First 300 characters of a provider response body, for the error text. */
export async function responseText(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 300);
  } catch {
    return '';
  }
}
