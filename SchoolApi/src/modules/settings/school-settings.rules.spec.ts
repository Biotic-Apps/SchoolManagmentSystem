import {
  isIanaTimeZone,
  isLocaleTag,
  schoolSettingsProblem,
} from './school-settings.rules';

describe('school settings rules', () => {
  it('validates IANA zones', () => {
    expect(isIanaTimeZone('Asia/Karachi')).toBe(true);
    expect(isIanaTimeZone('UTC')).toBe(true);
    expect(isIanaTimeZone('Mars/Olympus')).toBe(false);
    expect(isIanaTimeZone('+05:00')).toBe(false);
  });

  it('validates locales', () => {
    expect(isLocaleTag('en-PK')).toBe(true);
    expect(isLocaleTag('ur-PK')).toBe(true);
    expect(isLocaleTag('not a locale')).toBe(false);
  });

  it('reports the contrast ratio for a light primary colour', () => {
    expect(schoolSettingsProblem({ primaryColor: '#FFFF00' })).toMatch(
      /1\.07:1/,
    );
    expect(schoolSettingsProblem({ primaryColor: '#1F4E79' })).toBeNull();
    expect(schoolSettingsProblem({ timezone: 'Nowhere/City' })).toMatch(
      /timezone/,
    );
  });
});
