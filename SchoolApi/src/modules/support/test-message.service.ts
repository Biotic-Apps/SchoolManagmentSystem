import { Injectable } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { AppConfigService } from '../../config/app-config.service';
import { AuditService } from '../../core/audit/audit.service';
import { invalid } from '../../core/common/errors/errors';
import { maskPhone } from '../../core/common/masking';
import { toE164 } from '../../core/common/phone';
import type { AuthUser } from '../../core/common/types/auth-user';
import { ChannelRegistry } from '../../core/notifications/channels/channel-registry';
import { errorText } from '../../core/notifications/channels/provider-error';
import { maskEmail } from './contact-mask';
import type {
  TestMessageDto,
  TestMessageResultDto,
} from './dto/test-message.dto';

const TITLE = 'eSchool test message';
const BODY =
  'This is a test from eSchool Settings > Support. Delivery is working.';

/**
 * Sends one message synchronously through the configured provider so an
 * admin can check SMTP / SMS settings. Failures are returned, not thrown.
 */
@Injectable()
export class TestMessageService {
  constructor(
    private readonly channels: ChannelRegistry,
    private readonly config: AppConfigService,
    private readonly audit: AuditService,
  ) {}

  async send(
    user: AuthUser,
    input: TestMessageDto,
  ): Promise<TestMessageResultDto> {
    const to = this.destination(input);
    let result: TestMessageResultDto = { ok: true };
    try {
      await this.channels.get(input.channel).send({
        userId: user.id,
        title: TITLE,
        body: BODY,
        email: input.channel === 'EMAIL' ? to : null,
        phone: input.channel === 'SMS' ? to : null,
      });
    } catch (error) {
      result = { ok: false, error: errorText(error).slice(0, 300) };
    }
    this.audit.stage({
      action: 'support.test_message',
      entityType: 'NotificationChannel',
      entityId: input.channel,
      after: {
        channel: input.channel,
        to: input.channel === 'EMAIL' ? maskEmail(to) : maskPhone(to),
        driver: this.config.get(
          input.channel === 'EMAIL' ? 'EMAIL_DRIVER' : 'SMS_DRIVER',
        ),
        ok: result.ok,
      },
    });
    return result;
  }

  private destination({ channel, to }: TestMessageDto): string {
    const value = to.trim();
    if (channel === 'EMAIL') {
      if (!isEmail(value)) throw invalid('Enter a valid email address');
      return value.toLowerCase();
    }
    const phone = toE164(value, this.config.get('DEFAULT_PHONE_COUNTRY'));
    if (!phone) throw invalid('Enter a valid phone number');
    return phone;
  }
}
