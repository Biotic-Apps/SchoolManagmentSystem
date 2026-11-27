import { Injectable } from '@nestjs/common';
import { notFound } from '../../core/common/errors/errors';
import { UrlSigner } from '../../core/files/url-signer';
import type { BrandingDto } from './dto/branding.dto';
import { SCHOOL_SETTING_DEFAULTS } from './school-settings.mapper';
import { SettingsRepository } from './settings.repository';

export const DEFAULT_BRANDING: Readonly<BrandingDto> = Object.freeze({
  schoolName: SCHOOL_SETTING_DEFAULTS.appName,
  logoUrl: null,
  primaryColor: SCHOOL_SETTING_DEFAULTS.primaryColor,
  accentSoftColor: SCHOOL_SETTING_DEFAULTS.accentSoftColor,
  appName: SCHOOL_SETTING_DEFAULTS.appName,
});

/** Public login-page branding: only the five display fields. */
@Injectable()
export class BrandingService {
  constructor(
    private readonly repository: SettingsRepository,
    private readonly signer: UrlSigner,
  ) {}

  /**
   * With a schoolId: that active school's branding (404 otherwise).
   * Without: the only active school's branding on a single-school install,
   * else the default eSchool branding (no school yet, or several schools).
   */
  async get(schoolId?: string): Promise<BrandingDto> {
    const school = schoolId
      ? await this.repository.school(schoolId)
      : await this.repository.soleActiveSchool();
    if (!school) {
      if (schoolId) throw notFound('School');
      return { ...DEFAULT_BRANDING };
    }
    if (school.status !== 'ACTIVE') throw notFound('School');
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
