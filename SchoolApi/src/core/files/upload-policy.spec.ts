import { ErrorCode } from '../common/errors/error-code.enum';
import { checkUpload } from './upload-policy';

const PNG = Buffer.from('89504e470d0a1a0a0000', 'hex');
const PDF = Buffer.from('%PDF-1.7 test');

const file = (
  originalname: string,
  mimetype: string,
  buffer: Buffer,
  size = buffer.length,
) => ({
  originalname,
  mimetype,
  buffer,
  size,
});

const codeOf = (fn: () => unknown) => {
  try {
    fn();
    return 'ok';
  } catch (error) {
    return (error as { code: string }).code;
  }
};

describe('checkUpload', () => {
  it('accepts allowed types with matching signature', () => {
    expect(checkUpload(file('logo.PNG', 'image/png', PNG), true)).toBe('png');
    expect(checkUpload(file('a.pdf', 'application/pdf', PDF), false)).toBe(
      'pdf',
    );
  });

  it('rejects disallowed types and mismatched extensions', () => {
    expect(
      codeOf(() =>
        checkUpload(file('a.exe', 'application/x-msdownload', PDF), false),
      ),
    ).toBe(ErrorCode.VALIDATION_FAILED);
    expect(
      codeOf(() => checkUpload(file('a.pdf', 'image/png', PNG), false)),
    ).toBe(ErrorCode.VALIDATION_FAILED);
  });

  it('rejects spoofed content', () => {
    expect(
      codeOf(() => checkUpload(file('a.png', 'image/png', PDF), false)),
    ).toBe(ErrorCode.VALIDATION_FAILED);
  });

  it('applies per-type size limits', () => {
    expect(
      codeOf(() =>
        checkUpload(file('a.png', 'image/png', PNG, 6 * 1024 * 1024), false),
      ),
    ).toBe(ErrorCode.PAYLOAD_TOO_LARGE);
    expect(
      codeOf(() =>
        checkUpload(
          file('a.pdf', 'application/pdf', PDF, 9 * 1024 * 1024),
          false,
        ),
      ),
    ).toBe('ok');
  });

  it('requires an image for logos', () => {
    expect(
      codeOf(() => checkUpload(file('a.pdf', 'application/pdf', PDF), true)),
    ).toBe(ErrorCode.VALIDATION_FAILED);
  });
});
