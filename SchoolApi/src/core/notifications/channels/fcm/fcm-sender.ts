import type { ChannelMessage } from '../channel-message';
import { FcmAccessToken } from './fcm-access-token';
import type { FcmCredentials } from './fcm-credentials';

/** FCM HTTP v1: one request per device token; fails if no token accepted it. */
export class FcmSender {
  private readonly token: FcmAccessToken;

  constructor(private readonly credentials: FcmCredentials) {
    this.token = new FcmAccessToken(credentials);
  }

  async send(message: ChannelMessage): Promise<void> {
    const tokens = message.deviceTokens ?? [];
    if (tokens.length === 0) throw new Error('No device token for user');
    const accessToken = await this.token.get();
    const url = `https://fcm.googleapis.com/v1/projects/${this.credentials.projectId}/messages:send`;
    const data = Object.fromEntries(
      Object.entries(message.data ?? {}).map(([k, v]) => [k, String(v)]),
    );
    const results = await Promise.all(
      tokens.map((token) =>
        fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token,
              notification: { title: message.title, body: message.body },
              data,
            },
          }),
        }).then((r) => r.ok),
      ),
    );
    if (!results.some(Boolean)) throw new Error('FCM rejected all tokens');
  }
}
