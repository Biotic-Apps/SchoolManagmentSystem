import { FcmAccessToken } from './fcm-access-token';
import type { FcmCredentials } from './fcm-credentials';
import { FcmSender } from './fcm-sender';

const credentials = { projectId: 'demo' } as FcmCredentials;

function reply(status: number, body = '') {
  return { ok: status < 300, status, text: () => Promise.resolve(body) };
}

describe('FcmSender', () => {
  beforeEach(() => {
    jest.spyOn(FcmAccessToken.prototype, 'get').mockResolvedValue('access');
  });
  afterEach(() => jest.restoreAllMocks());

  it('sends category data with high priority and drops tokens FCM reports as gone', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(reply(200))
      .mockResolvedValueOnce(reply(404, '{"error":{"status":"NOT_FOUND"}}'))
      .mockResolvedValueOnce(
        reply(400, '{"error":{"details":[{"errorCode":"UNREGISTERED"}]}}'),
      );
    global.fetch = fetchMock;
    const dead = jest.fn<Promise<void>, [string]>().mockResolvedValue();
    await new FcmSender(credentials, dead).send({
      title: 'Fee due',
      body: 'Pay by Friday',
      data: { category: 'FEES', invoiceId: 'i-1' },
      deviceTokens: ['live', 'gone-404', 'gone-400'],
    });
    const body = JSON.parse(
      (fetchMock.mock.calls[0] as [string, { body: string }])[1].body,
    ) as { message: { data: Record<string, string>; android: object } };
    expect(body.message.data).toEqual({ category: 'FEES', invoiceId: 'i-1' });
    expect(body.message.android).toEqual({ priority: 'HIGH' });
    expect(dead.mock.calls.map(([t]) => t)).toEqual(['gone-404', 'gone-400']);
  });

  it('keeps tokens on other errors and fails when none accepted', async () => {
    global.fetch = jest.fn().mockResolvedValue(reply(500));
    const dead = jest.fn<Promise<void>, [string]>();
    await expect(
      new FcmSender(credentials, dead).send({
        title: 't',
        body: 'b',
        deviceTokens: ['a'],
      }),
    ).rejects.toThrow('FCM rejected all tokens');
    expect(dead).not.toHaveBeenCalled();
  });
});
