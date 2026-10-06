import { Module } from '@nestjs/common';
import { BrandingController } from './branding.controller';
import { BrandingService } from './branding.service';
import { NotificationSettingsService } from './notification-settings.service';
import { PoliciesService } from './policies.service';
import { SchoolConfigController } from './school-config.controller';
import { SchoolSettingsController } from './school-settings.controller';
import { SchoolSettingsService } from './school-settings.service';
import { SettingsRepository } from './settings.repository';

/** Phase 5 §A: school settings, branding, notification switches, policies. */
@Module({
  controllers: [
    SchoolSettingsController,
    SchoolConfigController,
    BrandingController,
  ],
  providers: [
    SettingsRepository,
    SchoolSettingsService,
    BrandingService,
    NotificationSettingsService,
    PoliciesService,
  ],
})
export class SettingsModule {}
