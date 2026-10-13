import { Global, Module } from '@nestjs/common';
import { BrandMigrationService } from './brand-migration.service';
import { SchoolSettingsReader } from './school-settings.reader';

@Global()
@Module({
  providers: [SchoolSettingsReader, BrandMigrationService],
  exports: [SchoolSettingsReader],
})
export class SchoolSettingsCoreModule {}
