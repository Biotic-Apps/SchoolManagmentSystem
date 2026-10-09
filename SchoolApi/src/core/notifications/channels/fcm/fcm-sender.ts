import type { ChannelMessage } from '../channel-message';
import { FcmAccessToken } from './fcm-access-token';
import type { FcmCredentials } from './fcm-credentials';

/** FCM says this token will never work again (app removed, token rotated). */
const DEAD_TOKEN = /UNREGISTERED|registration-token-not-registered/;

/** FCM HTTP v1: one request per device token; fails if no token accepted it. */
export class FcmSender {
  private readonly token: FcmAccessToken;

  constructor(
    private readonly credentials: FcmCredentials,
    /** Called for tokens FCM reports as gone, so they can be deleted. */
    private readonly onDeadToken?: (token: string) => Promise<void>,
  ) {
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
              android: { priority: 'HIGH' },
            },
          }),
        }).then((r) => this.outcome(token, r)),
      ),
    );
    if (!results.some(Boolean)) throw new Error('FCM rejected all tokens');
  }

  private async outcome(token: string, response: Response): Promise<boolean> {
    if (response.ok) return true;
    if (response.status === 404 || response.status === 400) {
      const text = await response.text().catch(() => '');
      if (response.status === 404 || DEAD_TOKEN.test(text))
        await this.onDeadToken?.(token).catch(() => undefined);
    }
    return false;
  }
}
