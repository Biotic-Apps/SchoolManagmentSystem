export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  /** School display name; replaces the one in EMAIL_FROM. */
  fromName?: string | null;
}

/** A real email provider (SMTP today). Throws a sanitised error on failure. */
export interface EmailSender {
  send(email: OutgoingEmail): Promise<void>;
}
