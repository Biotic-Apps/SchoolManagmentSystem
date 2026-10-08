import type { ChannelRegistry } from '../../notifications/channels/channel-registry';
import { LoginCodeMailer, LOGIN_CODE_SUBJECT } from './login-code-mailer';

function setup(send: jest.Mock<Promise<void>, [object]>) {
  const get = jest.fn().mockReturnValue({ send });
  const mailer = new LoginCodeMailer({ get } as unknown as ChannelRegistry);
  return { mailer, get };
}

describe('LoginCodeMailer', () => {
  it('emails the code with its validity through the EMAIL channel', () => {
    const send = jest
      .fn<Promise<void>, [object]>()
      .mockResolvedValue(undefined);
    const { mailer, get } = setup(send);
    mailer.send('u1', 'parent@example.com', '123456');
    expect(get).toHaveBeenCalledWith('EMAIL');
    const message = send.mock.calls[0][0] as {
      email: string;
      title: string;
      body: string;
    };
    expect(message.email).toBe('parent@example.com');
    expect(message.title).toBe(LOGIN_CODE_SUBJECT);
    expect(message.body).toContain('123456');
    expect(message.body).toContain('5 minutes');
    expect(message.body).toContain('ignore this email');
  });

  it('swallows delivery failures (the request already answered)', async () => {
    const send = jest
      .fn<Promise<void>, [object]>()
      .mockRejectedValue(new Error('SMTP down'));
    const { mailer } = setup(send);
    expect(() => mailer.send('u1', 'a@b.co', '123456')).not.toThrow();
    await new Promise((resolve) => setImmediate(resolve));
  });
});
