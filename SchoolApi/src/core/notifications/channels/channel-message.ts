/** Extras the HTML email shows: a code in large digits and/or a button. */
export interface EmailExtras {
  code?: string;
  /** Under the code, e.g. "Valid for 5 minutes". */
  codeNote?: string;
  action?: { label: string; url: string };
}

export interface ChannelMessage {
  userId?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  email?: string | null;
  phone?: string | null;
  deviceTokens?: string[];
  /** EMAIL only: rendered in the HTML part (the text part stays `body`). */
  extras?: EmailExtras;
}
