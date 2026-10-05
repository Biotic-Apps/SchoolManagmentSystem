import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import type { ChannelMessage } from './channel-message';
import { DevLogChannel } from './dev-log-channel';

@Injectable()
export class PushChannel extends DevLogChannel {
  constructor(config: AppConfigService) {
    super('PUSH', config);
  }

  protected destination(message: ChannelMessage): string | undefined {
    const count = message.deviceTokens?.length ?? 0;
    return count > 0 ? `${count} device(s)` : undefined;
  }
}
