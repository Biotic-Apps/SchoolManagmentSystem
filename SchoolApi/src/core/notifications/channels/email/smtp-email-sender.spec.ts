import { SmtpEmailSender } from './smtp-email-sender';

const env = {
  SMTP_HOST: 'smtp.example.com',
  SMTP_PORT: 587,
  SMTP_SECURE: false,
  SMTP_USER: 'mailer',
  SMTP_PASSWORD: 'p@ssw0rd-secret',
  EMAIL_FROM: 'eSchool <no-reply@school.pk>',
};

describe('SmtpEmailSender', () => {
  it('sends a plain-text mail with the school display name', async () => {
    const sendMail = jest.fn().mockResolvedValue({ messageId: '1' });
    await new SmtpEmailSender(env, { sendMail, verify: jest.fn() }).send({
      to: 'parent@example.com',
      subject: 'Fee due',
      text: 'Hello',
      fromName: 'Bright Future',
    });
    expect(sendMail).toHaveBeenCalledWith({
      from: '"Bright Future" <no-reply@school.pk>',
      to: 'parent@example.com',
      subject: 'Fee due',
      text: 'Hello',
    });
  });

  it('throws a sanitised error without the password', async () => {
    const sendMail = jest
      .fn()
      .mockRejectedValue(new Error('535 auth failed for p@ssw0rd-secret'));
    const sender = new SmtpEmailSender(env, { sendMail, verify: jest.fn() });
    const sent = sender.send({ to: 'a@b.c', subject: 's', text: 't' });
    await expect(sent).rejects.toThrow('SMTP: 535 auth failed for ***');
  });

  it('adds the HTML part when given', async () => {
    const sendMail = jest.fn().mockResolvedValue({ messageId: '1' });
    await new SmtpEmailSender(env, { sendMail, verify: jest.fn() }).send({
      to: 'parent@example.com',
      subject: 'Code',
      text: 'Hello',
      html: '<p>Hello</p>',
    });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Hello', html: '<p>Hello</p>' }),
    );
  });

  it('verifies the login with a sanitised error', async () => {
    const verify = jest
      .fn()
      .mockRejectedValue(new Error('535 bad login mailer p@ssw0rd-secret'));
    const sender = new SmtpEmailSender(env, { sendMail: jest.fn(), verify });
    await expect(sender.verify()).rejects.toThrow(
      'SMTP: 535 bad login *** ***',
    );
  });
});
