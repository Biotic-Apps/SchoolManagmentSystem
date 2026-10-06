import { Global, Module } from '@nestjs/common';
import { SchoolSettingsReader } from './school-settings.reader';

@Global()
@Module({
  providers: [SchoolSettingsReader],
  exports: [SchoolSettingsReader],
})
export class SchoolSettingsCoreModule {}
