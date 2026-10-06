export interface ChannelMessage {
  userId?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  email?: string | null;
  phone?: string | null;
  deviceTokens?: string[];
}
