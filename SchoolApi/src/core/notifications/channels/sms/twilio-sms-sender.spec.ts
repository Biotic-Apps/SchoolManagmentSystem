import { TwilioSmsSender } from './twilio-sms-sender';

const env = {
  TWILIO_ACCOUNT_SID: 'AC123',
  TWILIO_AUTH_TOKEN: 'token-secret-value',
  TWILIO_FROM: '+15005550006',
};

describe('TwilioSmsSender', () => {
  const fetchMock = jest.spyOn(global, 'fetch');

  afterEach(() => fetchMock.mockReset());
  afterAll(() => fetchMock.mockRestore());

  it('posts the message form with basic auth', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 201 }));
    await new TwilioSmsSender(env).send({
      to: '+923001112233',
      message: 'Hi',
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      'https://api.twilio.com/2010-04-01/Accounts/AC123/Messages.json',
    );
    expect((init!.headers as Record<string, string>).Authorization).toBe(
      `Basic ${Buffer.from('AC123:token-secret-value').toString('base64')}`,
    );
    expect((init!.body as URLSearchParams).toString()).toBe(
      'To=%2B923001112233&From=%2B15005550006&Body=Hi',
    );
  });

  it('reports the Twilio error without the phone number', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 21211,
          message: "The 'To' number +923001112233 is not valid.",
        }),
        { status: 400 },
      ),
    );
    const sent = new TwilioSmsSender(env).send({
      to: '+923001112233',
      message: 'Hi',
    });
    await expect(sent).rejects.toThrow(
      "Twilio 400: 21211 The 'To' number +92*******233 is not valid.",
    );
  });

  it('wraps network failures', async () => {
    fetchMock.mockRejectedValue(new Error('getaddrinfo ENOTFOUND'));
    const sent = new TwilioSmsSender(env).send({ to: '+92300', message: 'x' });
    await expect(sent).rejects.toThrow('Twilio: getaddrinfo ENOTFOUND');
  });
});
