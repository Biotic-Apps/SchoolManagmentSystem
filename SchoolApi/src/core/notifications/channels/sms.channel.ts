import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import type { ChannelMessage } from './channel-message';
import { DevLogChannel } from './dev-log-channel';

@Injectable()
export class SmsChannel extends DevLogChannel {
  constructor(config: AppConfigService) {
    super('SMS', config);
  }

  protected destination(message: ChannelMessage): string | undefined {
    return message.phone ?? undefined;
  }
}
