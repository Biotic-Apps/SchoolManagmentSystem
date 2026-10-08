import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageDriver } from './storage-driver';

export interface S3StorageOptions {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
}

/** RFC 6266 attachment header that survives non-ASCII file names. */
export function attachmentDisposition(fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7e]|["\\]/g, '_');
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

/**
 * S3 / MinIO / R2 object storage (AWS SDK v3). Objects are written with
 * SSE (AES256); the bucket must stay private — clients only ever receive
 * API-signed or S3-presigned, short-lived URLs.
 */
export class S3StorageDriver extends StorageDriver {
  readonly name = 's3' as const;
  private readonly bucket: string;

  constructor(
    options: S3StorageOptions,
    private readonly client: S3Client = new S3Client({
      endpoint: options.endpoint,
      region: options.region,
      forcePathStyle: options.forcePathStyle,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    }),
  ) {
    super();
    this.bucket = options.bucket;
  }

  async put(key: string, data: Buffer, mime: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: mime,
        ContentLength: data.length,
        ServerSideEncryption: 'AES256',
      }),
    );
  }

  /** Streams the file (no buffering); ContentLength lets S3 accept a stream. */
  async putFile(key: string, path: string, mime: string): Promise<void> {
    const { size } = await stat(path);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: createReadStream(path),
        ContentType: mime,
        ContentLength: size,
        ServerSideEncryption: 'AES256',
      }),
    );
  }

  async read(key: string): Promise<Readable> {
    const result = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    const body = result.Body;
    if (body instanceof Readable) return body;
    if (body && 'transformToWebStream' in body) {
      return Readable.fromWeb(
        body.transformToWebStream() as Parameters<typeof Readable.fromWeb>[0],
      );
    }
    throw new Error(`Empty S3 object body for ${key}`);
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async check(): Promise<boolean> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return true;
    } catch {
      return false;
    }
  }

  presignedUrl(
    key: string,
    ttlSeconds: number,
    fileName: string,
  ): Promise<string | null> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: attachmentDisposition(fileName),
      }),
      { expiresIn: ttlSeconds },
    );
  }
}
