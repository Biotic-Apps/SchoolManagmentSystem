import { restoreCopyArchive } from '../dump/copy-restorer';
import { restoreWithPgRestore } from '../dump/pg-dumper';
import { withClient, type PgTarget } from '../dump/pg-target';
import { collectStats, type SourceStats } from '../dump/source-stats';
import { withScratchDatabase } from './scratch-database';
import { check, compareStats, type VerifyCheck } from './verify-checks';

export interface RestoreCheckInput {
  source: PgTarget;
  format: string;
  /** Decrypted dump file. */
  dumpFile: string;
  expected: SourceStats;
  pgRestoreBinary: string;
}

/** Restores into `<db>_restore_check`, compares, always drops it. */
export function restoreAndCompare(
  input: RestoreCheckInput,
): Promise<VerifyCheck[]> {
  return withScratchDatabase(input.source, async (scratch) => {
    if (input.format === 'copy') {
      return withClient(scratch, async (client) => {
        const result = await restoreCopyArchive(client, input.dumpFile);
        const fkOk = result.foreignKeyErrors.length === 0;
        const checks = [
          check('restore', 'ok', 'ok'),
          check(
            'foreign keys',
            result.foreignKeys,
            result.foreignKeys - result.foreignKeyErrors.length,
            fkOk,
          ),
        ];
        if (!fkOk) {
          checks[1].actual = result.foreignKeyErrors[0].slice(0, 300);
        }
        const actual = await collectStats(client, result.header.migrations);
        return [...checks, ...compareStats(input.expected, actual)];
      });
    }
    if (input.format !== 'pg_dump') {
      throw new Error(`Unknown backup format ${input.format}`);
    }
    await restoreWithPgRestore(scratch, input.pgRestoreBinary, input.dumpFile);
    const actual = await withClient(scratch, (client) => collectStats(client));
    return [
      check('restore', 'ok', 'ok'),
      ...compareStats(input.expected, actual),
    ];
  });
}
