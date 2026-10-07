import { HttpSmsSender } from './http-sms-sender';

const base = {
  SMS_HTTP_URL: 'https://gateway.local/send?api_key=k3y-secret',
  SMS_HTTP_METHOD: 'POST' as const,
  SMS_HTTP_HEADERS: undefined,
  SMS_HTTP_BODY: undefined,
};

describe('HttpSmsSender', () => {
  const fetchMock = jest.spyOn(global, 'fetch');

  beforeEach(() => fetchMock.mockResolvedValue(new Response('OK')));
  afterEach(() => fetchMock.mockReset());
  afterAll(() => fetchMock.mockRestore());

  const lastCall = () => fetchMock.mock.calls[0];

  it('sends the default JSON body with escaped values', async () => {
    await new HttpSmsSender(base).send({
      to: '+923001112233',
      message: 'Say "hi"\nnow',
      senderId: 'SCHOOL',
    });
    const [, init] = lastCall();
    expect(init!.method).toBe('POST');
    expect(init!.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init!.body as string)).toEqual({
      to: '+923001112233',
      message: 'Say "hi"\nnow',
      senderId: 'SCHOOL',
    });
  });

  it('fills a form template and URL placeholders', async () => {
    await new HttpSmsSender({
      ...base,
      SMS_HTTP_URL: 'https://gateway.local/send?to={{to}}',
      SMS_HTTP_HEADERS: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      SMS_HTTP_BODY: 'text={{message}}&from={{senderId}}',
    }).send({ to: '+923001112233', message: 'a&b c' });
    const [url, init] = lastCall();
    expect(url).toBe('https://gateway.local/send?to=%2B923001112233');
    expect(init!.body).toBe('text=a%26b%20c&from=');
  });

  it('sends no body for GET', async () => {
    await new HttpSmsSender({ ...base, SMS_HTTP_METHOD: 'GET' }).send({
      to: '+92300',
      message: 'x',
    });
    expect(lastCall()[1]!.body).toBeUndefined();
  });

  it('fails on non-2xx without leaking the key or number', async () => {
    fetchMock.mockResolvedValue(
      new Response('bad key k3y-secret for 923001112233', { status: 401 }),
    );
    const sent = new HttpSmsSender(base).send({ to: '+92300', message: 'x' });
    await expect(sent).rejects.toThrow(
      'SMS gateway 401: bad key *** for 923******233',
    );
  });
});
