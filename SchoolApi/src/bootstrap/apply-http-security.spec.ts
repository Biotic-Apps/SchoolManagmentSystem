import { corpFor } from './apply-http-security';

describe('corpFor', () => {
  it('lets the web origin embed signed file content', () => {
    expect(corpFor('/api/v1/files/0133c56e-1/content')).toBe('cross-origin');
  });

  it('keeps every other route same-origin', () => {
    expect(corpFor('/api/v1/branding')).toBe('same-origin');
    expect(corpFor('/api/v1/files/0133c56e-1/url')).toBe('same-origin');
    expect(corpFor('/api/v1/students')).toBe('same-origin');
  });
});
