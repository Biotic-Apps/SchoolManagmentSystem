export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  /** Branded HTML alternative of `text`. */
  html?: string;
  /** School display name; replaces the one in EMAIL_FROM. */
  fromName?: string | null;
}

/** A real email provider (SMTP today). Throws a sanitised error on failure. */
export interface EmailSender {
  send(email: OutgoingEmail): Promise<void>;
  /** Checks the connection and login; throws a sanitised error. */
  verify(): Promise<void>;
}
