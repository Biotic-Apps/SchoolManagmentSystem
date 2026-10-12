export interface OutgoingWhatsApp {
  /** E.164 number. */
  to: string;
  message: string;
}

/** A real WhatsApp provider. Throws a sanitised error on failure. */
export interface WhatsAppSender {
  send(msg: OutgoingWhatsApp): Promise<void>;
}

export const WHATSAPP_TIMEOUT_MS = 15_000;

/** First 300 characters of a provider response body, for the error text. */
export async function responseText(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 300);
  } catch {
    return '';
  }
}
