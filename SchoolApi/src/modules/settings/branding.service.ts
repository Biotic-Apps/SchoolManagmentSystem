import { Injectable } from '@nestjs/common';
import { notFound } from '../../core/common/errors/errors';
import { UrlSigner } from '../../core/files/url-signer';
import type { BrandingDto } from './dto/branding.dto';
import { SCHOOL_SETTING_DEFAULTS } from './school-settings.mapper';
import { SettingsRepository } from './settings.repository';

/** Public login-page branding: only the five display fields. */
@Injectable()
export class BrandingService {
  constructor(
    private readonly repository: SettingsRepository,
    private readonly signer: UrlSigner,
  ) {}

  async get(schoolId?: string): Promise<BrandingDto> {
    const school = schoolId
      ? await this.repository.school(schoolId)
      : await this.repository.defaultSchool();
    if (!school || school.status !== 'ACTIVE') throw notFound('School');
    const [row, logo] = await Promise.all([
      this.repository.settings(school.id),
      this.repository.servableLogo(school.logoFileId),
    ]);
    return {
      schoolName: row?.displayName ?? school.name,
      logoUrl: logo ? this.signer.sign(logo).url : null,
      primaryColor: row?.primaryColor ?? SCHOOL_SETTING_DEFAULTS.primaryColor,
      accentSoftColor:
        row?.accentSoftColor ?? SCHOOL_SETTING_DEFAULTS.accentSoftColor,
      appName: row?.appName ?? SCHOOL_SETTING_DEFAULTS.appName,
    };
  }
}
