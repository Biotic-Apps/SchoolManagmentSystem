export type ScanResult =
  | { status: 'CLEAN' }
  | { status: 'INFECTED'; signature: string }
  /** Scanner unreachable / timed out / protocol error. */
  | { status: 'FAILED'; error: string }
  /** No scanner configured (CLAMAV_HOST unset): file stays PENDING. */
  | { status: 'SKIPPED' };

/** Antivirus hook for uploads (security.md §6). */
export abstract class AntivirusScanner {
  abstract readonly enabled: boolean;
  abstract scan(data: Buffer): Promise<ScanResult>;
}

export class NoopScanner extends AntivirusScanner {
  readonly enabled = false;

  scan(): Promise<ScanResult> {
    return Promise.resolve({ status: 'SKIPPED' });
  }
}
