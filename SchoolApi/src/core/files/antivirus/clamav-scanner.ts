import { connect } from 'node:net';
import { AntivirusScanner, type ScanResult } from './antivirus-scanner';
import { instreamFrames, parseClamdReply } from './clamd-protocol';

export interface ClamAvOptions {
  host: string;
  port: number;
  /** Whole-scan budget (connect + upload + verdict). */
  timeoutMs?: number;
}

/** ClamAV over TCP (clamd INSTREAM). Never throws: errors → FAILED. */
export class ClamAvScanner extends AntivirusScanner {
  readonly enabled = true;

  constructor(private readonly options: ClamAvOptions) {
    super();
  }

  scan(data: Buffer): Promise<ScanResult> {
    const { host, port, timeoutMs = 15_000 } = this.options;
    return new Promise<ScanResult>((resolve) => {
      const replies: Buffer[] = [];
      let settled = false;
      const finish = (result: ScanResult) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve(result);
      };
      const socket = connect({ host, port }, () => {
        for (const frame of instreamFrames(data)) socket.write(frame);
      });
      socket.setTimeout(timeoutMs, () =>
        finish({ status: 'FAILED', error: 'clamd timeout' }),
      );
      socket.on('data', (chunk: Buffer) => {
        replies.push(chunk);
        if (chunk.includes(0)) {
          finish(parseClamdReply(Buffer.concat(replies).toString('utf8')));
        }
      });
      socket.on('end', () =>
        finish(parseClamdReply(Buffer.concat(replies).toString('utf8'))),
      );
      socket.on('error', (error) =>
        finish({ status: 'FAILED', error: error.message }),
      );
    });
  }
}
