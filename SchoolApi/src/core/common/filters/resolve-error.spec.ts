import { resolveError } from './resolve-error';

describe('resolveError (body-parser errors)', () => {
  it('maps an oversized body to 413 PAYLOAD_TOO_LARGE', () => {
    const error = Object.assign(new Error('request entity too large'), {
      type: 'entity.too.large',
      status: 413,
    });
    const { status, body } = resolveError(error);
    expect(status).toBe(413);
    expect(body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('maps malformed JSON to 400', () => {
    const error = Object.assign(new SyntaxError('Unexpected token'), {
      type: 'entity.parse.failed',
      status: 400,
    });
    expect(resolveError(error).status).toBe(400);
  });

  it('keeps unknown errors as 500 without details', () => {
    const { status, body } = resolveError(new Error('db password=secret'));
    expect(status).toBe(500);
    expect(JSON.stringify(body)).not.toContain('secret');
  });
});
