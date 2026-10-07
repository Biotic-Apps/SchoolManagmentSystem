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
    await new SmtpEmailSender(env, { sendMail }).send({
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
    const sender = new SmtpEmailSender(env, { sendMail });
    const sent = sender.send({ to: 'a@b.c', subject: 's', text: 't' });
    await expect(sent).rejects.toThrow('SMTP: 535 auth failed for ***');
  });
});
