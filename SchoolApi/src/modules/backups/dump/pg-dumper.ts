import { runPgTool } from './pg-tools';
import { withClient, type PgTarget } from './pg-target';
import { collectStats, type SourceStats } from './source-stats';

/**
 * `pg_dump -Fc` of the snapshot exported by a REPEATABLE READ transaction
 * that also reads the source stats, so both describe the same data.
 */
export function dumpWithPgDump(
  source: PgTarget,
  binary: string,
  outFile: string,
): Promise<SourceStats> {
  return withClient(source, async (client) => {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    try {
      const snapshot = await client.query<{ id: string }>(
        'SELECT pg_export_snapshot() AS id',
      );
      const stats = await collectStats(client);
      await runPgTool(
        binary,
        [
          '--format=custom',
          `--snapshot=${snapshot.rows[0].id}`,
          `--file=${outFile}`,
          '--no-password',
          `--dbname=${source.database}`,
        ],
        source,
      );
      await client.query('COMMIT');
      return stats;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    }
  });
}

/** pg_restore into the (empty) scratch database. */
export function restoreWithPgRestore(
  scratch: PgTarget,
  binary: string,
  dumpFile: string,
): Promise<void> {
  return runPgTool(
    binary,
    [
      '--no-owner',
      '--no-privileges',
      '--exit-on-error',
      '--no-password',
      `--dbname=${scratch.database}`,
      dumpFile,
    ],
    scratch,
  );
}
