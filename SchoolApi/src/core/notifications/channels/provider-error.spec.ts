import { providerError } from './provider-error';

describe('providerError', () => {
  it('removes secrets, auth headers and full phone numbers', () => {
    const error = providerError(
      'Auth sk_live_SECRET failed for +923001112233 (Bearer abc.def)',
      ['sk_live_SECRET'],
    );
    expect(error.message).toBe(
      'Auth *** failed for +92*******233 (Bearer ***)',
    );
  });

  it('truncates to 300 characters', () => {
    expect(providerError('x'.repeat(1000)).message).toHaveLength(300);
  });

  it('never returns an empty message', () => {
    expect(providerError('   ').message).toBe('Provider error');
  });
});
