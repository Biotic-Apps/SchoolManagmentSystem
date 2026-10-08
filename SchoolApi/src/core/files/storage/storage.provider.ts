import type { Provider } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { LocalStorageDriver } from './local-storage.driver';
import { S3StorageDriver } from './s3-storage.driver';
import { StorageDriver } from './storage-driver';

export const storageProvider: Provider = {
  provide: StorageDriver,
  inject: [AppConfigService],
  useFactory: (config: AppConfigService): StorageDriver => {
    if (config.get('STORAGE_DRIVER') === 's3') {
      // env.schema guarantees bucket + credentials when the driver is s3.
      return new S3StorageDriver({
        endpoint: config.get('S3_ENDPOINT'),
        region: config.get('S3_REGION'),
        bucket: config.get('S3_BUCKET') ?? '',
        accessKeyId: config.get('S3_ACCESS_KEY') ?? '',
        secretAccessKey: config.get('S3_SECRET_KEY') ?? '',
        forcePathStyle: config.get('S3_FORCE_PATH_STYLE'),
      });
    }
    return new LocalStorageDriver(config.get('STORAGE_LOCAL_DIR'));
  },
};
