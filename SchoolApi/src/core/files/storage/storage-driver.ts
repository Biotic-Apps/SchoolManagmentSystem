import type { Readable } from 'node:stream';

/** Object storage: `local` (dev default) or `s3` (S3 / MinIO / R2). */
export abstract class StorageDriver {
  abstract readonly name: 'local' | 's3';
  abstract put(key: string, data: Buffer, mime: string): Promise<void>;
  /** Streams a local file into storage (large objects such as backups). */
  abstract putFile(key: string, path: string, mime: string): Promise<void>;
  abstract read(key: string): Promise<Readable>;
  abstract delete(key: string): Promise<void>;
  /** Cheap reachability check for /support/health. */
  abstract check(): Promise<boolean>;
  /**
   * Direct, short-lived download URL (S3 presigned), or null when the API
   * has to stream the object itself (local driver).
   */
  abstract presignedUrl(
    key: string,
    ttlSeconds: number,
    fileName: string,
  ): Promise<string | null>;
}
