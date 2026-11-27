import type { UrlSigner } from '../../core/files/url-signer';
import { BrandingService, DEFAULT_BRANDING } from './branding.service';
import type { SettingsRepository, SettingsSchool } from './settings.repository';

const school = (over: Partial<SettingsSchool> = {}): SettingsSchool => ({
  id: 'school-1',
  name: 'Bright School',
  status: 'ACTIVE',
  logoFileId: null,
  createdAt: new Date('2026-01-01'),
  ...over,
});

function build(found: {
  byId?: SettingsSchool | null;
  sole?: SettingsSchool | null;
}) {
  const repository = {
    school: jest.fn().mockResolvedValue(found.byId ?? null),
    soleActiveSchool: jest.fn().mockResolvedValue(found.sole ?? null),
    settings: jest.fn().mockResolvedValue(null),
    servableLogo: jest.fn().mockResolvedValue(null),
  };
  const signer = { sign: jest.fn() };
  const service = new BrandingService(
    repository as unknown as SettingsRepository,
    signer as unknown as UrlSigner,
  );
  return { service, repository };
}

describe('BrandingService', () => {
  it('returns the default eSchool branding when no school is active', async () => {
    const { service } = build({ sole: null });
    await expect(service.get()).resolves.toEqual(DEFAULT_BRANDING);
  });

  it("returns the only active school's branding on a single-school install", async () => {
    const { service } = build({ sole: school() });
    await expect(service.get()).resolves.toMatchObject({
      schoolName: 'Bright School',
      appName: 'eSchool',
    });
  });

  it('uses the requested school and 404s for an unknown or inactive one', async () => {
    const ok = build({ byId: school({ name: 'Scoped School' }) });
    await expect(ok.service.get('school-1')).resolves.toMatchObject({
      schoolName: 'Scoped School',
    });
    expect(ok.repository.soleActiveSchool).not.toHaveBeenCalled();

    await expect(build({ byId: null }).service.get('x')).rejects.toThrow();
    await expect(
      build({
        byId: school({ status: 'ARCHIVED' as SettingsSchool['status'] }),
      }).service.get('school-1'),
    ).rejects.toThrow();
  });
});
