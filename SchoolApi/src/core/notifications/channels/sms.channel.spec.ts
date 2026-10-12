import type { AppConfigService } from '../../../config/app-config.service';
import type { PrismaService } from '../../prisma/prisma.service';
import type { SenderIdentityResolver } from './sender-identity';
import { SmsChannel } from './sms.channel';

function channel(env: Record<string, unknown>) {
  const values: Record<string, unknown> = {
    NODE_ENV: 'development',
    SMS_DRIVER: 'log',
    ALLOW_LOG_CHANNELS: false,
    DEFAULT_PHONE_COUNTRY: '+92',
    SMS_HTTP_METHOD: 'POST',
    ...env,
  };
  const config = {
    get: (key: string) => values[key],
    get isProduction() {
      return values.NODE_ENV === 'production';
    },
  } as unknown as AppConfigService;
  const identity = {
    forUser: jest.fn().mockResolvedValue({ fromName: null, senderId: 'BFS', schoolId: null }),
  } as unknown as SenderIdentityResolver;
  const prisma = {} as unknown as PrismaService;
  return new SmsChannel(config, identity, prisma);
}

const message = { title: 'Code', body: '123456', phone: '0300-1112233' };

describe('SmsChannel', () => {
  const fetchMock = jest.spyOn(global, 'fetch');

  afterEach(() => fetchMock.mockReset());
  afterAll(() => fetchMock.mockRestore());

  it('logs with the log driver outside production', async () => {
    await expect(channel({}).send(message)).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails with the log driver in production', async () => {
    await expect(
      channel({ NODE_ENV: 'production' }).send(message),
    ).rejects.toThrow('SMS provider not configured');
  });

  it('logs in production only with ALLOW_LOG_CHANNELS', async () => {
    const staging = channel({
      NODE_ENV: 'production',
      ALLOW_LOG_CHANNELS: true,
    });
    await expect(staging.send(message)).resolves.toBeUndefined();
  });

  it('sends E.164 numbers and the school sender id via the http driver', async () => {
    fetchMock.mockResolvedValue(new Response('OK'));
    await channel({
      SMS_DRIVER: 'http',
      SMS_HTTP_URL: 'https://gateway.local/send',
    }).send(message);
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toEqual({
      to: '+923001112233',
      message: 'Code: 123456',
      senderId: 'BFS',
    });
  });

  it('rejects numbers that cannot be normalised', async () => {
    const http = channel({
      SMS_DRIVER: 'http',
      SMS_HTTP_URL: 'https://gateway.local/send',
    });
    await expect(http.send({ ...message, phone: 'n/a' })).rejects.toThrow(
      'Phone number is not valid',
    );
  });
});
