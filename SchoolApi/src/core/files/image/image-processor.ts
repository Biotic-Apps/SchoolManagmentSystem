import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { invalid } from '../../common/errors/errors';

export const MAX_IMAGE_DIMENSION = 2048;
/** ~40 MP: rejects decompression bombs before sharp allocates the pixels. */
export const MAX_INPUT_PIXELS = 40_000_000;

export interface ProcessedImage {
  buffer: Buffer;
  mime: 'image/jpeg' | 'image/png';
  extension: 'jpg' | 'png';
  width: number;
  height: number;
}

/**
 * Re-encodes every uploaded image (security.md §6):
 * - `.rotate()` applies the EXIF orientation, then all metadata (EXIF, GPS,
 *   ICC, XMP) is dropped — sharp writes none unless `withMetadata()` is used;
 * - fits inside 2048×2048 without enlarging;
 * - output is JPEG (q85, mozjpeg) or, when the source has transparency, PNG.
 *   JPEG/PNG (not WebP) because PDF renderers (ID cards, report cards) only
 *   embed those two formats.
 * Undecodable or oversized (pixel count) input → 400.
 */
@Injectable()
export class ImageProcessor {
  async reencode(input: Buffer): Promise<ProcessedImage> {
    try {
      const image = sharp(input, {
        limitInputPixels: MAX_INPUT_PIXELS,
        failOn: 'error',
      });
      const meta = await image.metadata();
      const alpha = meta.hasAlpha === true;
      const pipeline = image.rotate().resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      });
      const { data, info } = await (
        alpha
          ? pipeline.png({ compressionLevel: 9 })
          : pipeline.flatten({ background: '#ffffff' }).jpeg({
              quality: 85,
              mozjpeg: true,
            })
      ).toBuffer({ resolveWithObject: true });
      return {
        buffer: data,
        mime: alpha ? 'image/png' : 'image/jpeg',
        extension: alpha ? 'png' : 'jpg',
        width: info.width,
        height: info.height,
      };
    } catch {
      throw invalid('Image could not be processed (corrupt or too large)');
    }
  }
}
