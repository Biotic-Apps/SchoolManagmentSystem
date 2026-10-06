import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { invalid } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { FileRefService } from '../../core/files/file-ref.service';
import { UrlSigner } from '../../core/files/url-signer';
import type { Scope } from '../../core/rbac/scope/scope';
import { SchoolSettingsReader } from '../../core/school-settings/school-settings.reader';
import type { SchoolSettingsDto } from './dto/school-settings.dto';
import type { UpdateSchoolSettingsDto } from './dto/update-school-settings.dto';
import { toSchoolSettingsDto } from './school-settings.mapper';
import { schoolSettingsProblem } from './school-settings.rules';
import { editableSchool, readableSchool } from './settings-access';
import { SettingsRepository, type SettingsSchool } from './settings.repository';

@Injectable()
export class SchoolSettingsService {
  constructor(
    private readonly repository: SettingsRepository,
    private readonly files: FileRefService,
    private readonly signer: UrlSigner,
    private readonly reader: SchoolSettingsReader,
    private readonly audit: AuditService,
  ) {}

  async get(scope: Scope, schoolId: string): Promise<SchoolSettingsDto> {
    return this.load(await readableSchool(this.repository, scope, schoolId));
  }

  async update(
    user: AuthUser,
    scope: Scope,
    schoolId: string,
    dto: UpdateSchoolSettingsDto,
  ): Promise<SchoolSettingsDto> {
    const school = await editableSchool(this.repository, user, scope, schoolId);
    const problem = schoolSettingsProblem(dto);
    if (problem) throw invalid(problem);
    if (dto.logoFileId) {
      await this.files.assertUsable(dto.logoFileId, {
        schoolId,
        userId: user.id,
        purposes: ['SCHOOL_LOGO'],
      });
    }
    const before = await this.load(school);
    const { logoFileId, ...fields } = dto;
    await this.repository.saveSchoolSettings(
      schoolId,
      {
        ...fields,
        primaryColor: fields.primaryColor?.toUpperCase(),
        accentSoftColor: fields.accentSoftColor?.toUpperCase(),
        updatedById: user.id,
      },
      logoFileId,
      user.id,
    );
    await this.reader.invalidate(schoolId);
    const after = await this.load((await this.repository.school(schoolId))!);
    this.audit.stage({
      action: 'settings.school.update',
      entityType: 'SchoolSetting',
      entityId: schoolId,
      schoolId,
      before: { ...before, logoUrl: undefined },
      after: { ...after, logoUrl: undefined },
    });
    return after;
  }

  private async load(school: SettingsSchool): Promise<SchoolSettingsDto> {
    const [row, logo] = await Promise.all([
      this.repository.settings(school.id),
      this.repository.servableLogo(school.logoFileId),
    ]);
    const logoUrl = logo ? this.signer.sign(logo).url : null;
    return toSchoolSettingsDto(school, row, logoUrl);
  }
}
