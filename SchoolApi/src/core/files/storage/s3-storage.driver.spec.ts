import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { attachmentDisposition, S3StorageDriver } from './s3-storage.driver';

const options = {
  endpoint: 'http://minio.local:9000',
  region: 'us-east-1',
  bucket: 'eschool',
  accessKeyId: 'AKIATEST',
  secretAccessKey: 'secret-test',
  forcePathStyle: true,
};

describe('S3StorageDriver', () => {
  const client = new S3Client({
    endpoint: options.endpoint,
    region: options.region,
    forcePathStyle: true,
    credentials: { accessKeyId: 'AKIATEST', secretAccessKey: 'secret-test' },
  });
  const s3 = mockClient(client);
  const driver = new S3StorageDriver(options, client);

  beforeEach(() => s3.reset());

  it('puts buffers with content type, length and AES256 SSE', async () => {
    s3.on(PutObjectCommand).resolves({});
    await driver.put('a/b.png', Buffer.from('abc'), 'image/png');
    const input = s3.commandCalls(PutObjectCommand)[0].args[0].input;
    expect(input).toMatchObject({
      Bucket: 'eschool',
      Key: 'a/b.png',
      ContentType: 'image/png',
      ContentLength: 3,
      ServerSideEncryption: 'AES256',
    });
  });

  it('streams files with their size as ContentLength', async () => {
    s3.on(PutObjectCommand).resolves({});
    const dir = await mkdtemp(join(tmpdir(), 's3-spec-'));
    const path = join(dir, 'dump.bin');
    await writeFile(path, Buffer.alloc(1234, 1));
    try {
      await driver.putFile('backups/x.bin', path, 'application/octet-stream');
      const input = s3.commandCalls(PutObjectCommand)[0].args[0].input;
      expect(input.ContentLength).toBe(1234);
      expect(input.ServerSideEncryption).toBe('AES256');
      expect(input.Body).toBeInstanceOf(Readable);
      (input.Body as Readable).destroy();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('reads the object body as a Readable', async () => {
    const body = Readable.from([Buffer.from('hello')]);
    s3.on(GetObjectCommand).resolves({ Body: body as never });
    const stream = await driver.read('k');
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    expect(Buffer.concat(chunks).toString()).toBe('hello');
  });

  it('deletes objects and checks the bucket', async () => {
    s3.on(DeleteObjectCommand).resolves({});
    s3.on(HeadBucketCommand).resolvesOnce({}).rejectsOnce(new Error('down'));
    await driver.delete('k');
    expect(s3.commandCalls(DeleteObjectCommand)[0].args[0].input).toEqual({
      Bucket: 'eschool',
      Key: 'k',
    });
    await expect(driver.check()).resolves.toBe(true);
    await expect(driver.check()).resolves.toBe(false);
  });

  it('presigns a GET with an attachment disposition and the ttl', async () => {
    const url = await driver.presignedUrl('backups/x.bin', 300, 'backup.bin');
    expect(url).toContain('http://minio.local:9000/eschool/backups/x.bin');
    expect(url).toContain('X-Amz-Expires=300');
    expect(url).toContain('response-content-disposition=attachment');
  });

  it('builds an ASCII-safe attachment disposition', () => {
    expect(attachmentDisposition('رپورٹ "1".pdf')).toBe(
      `attachment; filename="_____ _1_.pdf"; filename*=UTF-8''${encodeURIComponent('رپورٹ "1".pdf')}`,
    );
  });
});
