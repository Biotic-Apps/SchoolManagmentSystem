import sharp from 'sharp';
import { AppError } from '../../common/errors/app-error';
import { ImageProcessor, MAX_IMAGE_DIMENSION } from './image-processor';

/** A JPEG carrying EXIF (camera make + orientation 6 = rotate 90° CW). */
function jpegWithExif(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: '#0b7f74' },
  })
    .jpeg()
    .withExif({ IFD0: { Make: 'SpyCam' } })
    .withMetadata({ orientation: 6 })
    .toBuffer();
}

describe('ImageProcessor', () => {
  const processor = new ImageProcessor();

  it('strips EXIF, applies orientation and caps at 2048 px', async () => {
    const input = await jpegWithExif(3000, 1000);
    const before = await sharp(input).metadata();
    expect(before.exif).toBeDefined();
    expect(before.orientation).toBe(6);

    const out = await processor.reencode(input);
    const meta = await sharp(out.buffer).metadata();
    expect(out.mime).toBe('image/jpeg');
    expect(out.extension).toBe('jpg');
    expect(meta.format).toBe('jpeg');
    expect(meta.exif).toBeUndefined();
    expect(meta.orientation).toBeUndefined();
    // Orientation 6 → portrait after rotation; longest side capped.
    expect(meta.height).toBe(MAX_IMAGE_DIMENSION);
    expect(meta.width).toBe(Math.round((1000 / 3000) * MAX_IMAGE_DIMENSION));
  });

  it('does not enlarge small images', async () => {
    const input = await sharp({
      create: { width: 40, height: 30, channels: 3, background: '#fff' },
    })
      .webp()
      .toBuffer();
    const out = await processor.reencode(input);
    expect([out.width, out.height, out.mime]).toEqual([40, 30, 'image/jpeg']);
  });

  it('keeps transparency as PNG', async () => {
    const input = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toBuffer();
    const out = await processor.reencode(input);
    expect(out.mime).toBe('image/png');
    expect((await sharp(out.buffer).metadata()).hasAlpha).toBe(true);
  });

  it('rejects undecodable input with 400', async () => {
    const corrupt = Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      Buffer.alloc(64, 7),
    ]);
    await expect(processor.reencode(corrupt)).rejects.toBeInstanceOf(AppError);
  });

  it('rejects decompression bombs (pixel limit)', async () => {
    const huge = await sharp({
      create: { width: 8000, height: 8000, channels: 3, background: '#000' },
    })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await expect(processor.reencode(huge)).rejects.toBeInstanceOf(AppError);
  });
});
