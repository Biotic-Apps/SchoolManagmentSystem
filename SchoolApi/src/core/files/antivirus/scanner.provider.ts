import type { Provider } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { AntivirusScanner, NoopScanner } from './antivirus-scanner';
import { ClamAvScanner } from './clamav-scanner';

/** ClamAV when CLAMAV_HOST is set; otherwise uploads stay unscanned (PENDING). */
export const scannerProvider: Provider = {
  provide: AntivirusScanner,
  inject: [AppConfigService],
  useFactory: (config: AppConfigService): AntivirusScanner => {
    const host = config.get('CLAMAV_HOST');
    return host
      ? new ClamAvScanner({ host, port: config.get('CLAMAV_PORT') })
      : new NoopScanner();
  },
};
