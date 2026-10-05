import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import type { ChannelMessage } from './channel-message';
import { DevLogChannel } from './dev-log-channel';

@Injectable()
export class EmailChannel extends DevLogChannel {
  constructor(config: AppConfigService) {
    super('EMAIL', config);
  }

  protected destination(message: ChannelMessage): string | undefined {
    return message.email ?? undefined;
  }
}
