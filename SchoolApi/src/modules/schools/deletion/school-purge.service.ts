import { Injectable, Logger } from '@nestjs/common';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { planDeletes } from './closure/delete-plan';
import { runDeletes } from './closure/run-deletes';
import { sqlRunner } from './closure/sql-runner';
import {
  countMarks,
  markedStorageKeys,
  markSchoolClosure,
} from './school-closure';

export interface PurgeCounts {
  /** Rows per table. */
  tables: Record<string, number>;
  removedUsers: number;
  keptUsers: number;
}

/** Large schools: marking + deleting can take a while. */
const TX_OPTIONS = { maxWait: 10_000, timeout: 15 * 60_000 };

/** Computes and performs the permanent removal of one school. */
@Injectable()
export class SchoolPurgeService {
  private readonly logger = new Logger(SchoolPurgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
  ) {}

  /** Dry run: marks rows and counts them; nothing is changed. */
  preview(schoolId: string): Promise<PurgeCounts> {
    return this.prisma.$transaction(async (tx) => {
      const sql = sqlRunner(tx);
      const closure = await markSchoolClosure(sql, schoolId);
      return {
        tables: await countMarks(closure.marks),
        removedUsers: closure.removedUserIds.length,
        keptUsers: closure.keptUserCount,
      };
    }, TX_OPTIONS);
  }

  /** Deletes everything in one transaction, then the stored files. */
  async purge(schoolId: string): Promise<PurgeCounts> {
    const { counts, storageKeys } = await this.prisma.$transaction(
      async (tx) => {
        const sql = sqlRunner(tx);
        // Blocks new rows that reference the school while we work.
        await sql.query(
          'select id from schools where id = $1::uuid for update',
          schoolId,
        );
        const closure = await markSchoolClosure(sql, schoolId);
        const keys = await markedStorageKeys(sql, closure.marks);
        const steps = planDeletes(
          closure.marks.tables(),
          closure.marks.graph.foreignKeys,
        );
        // Counted before deleting: cascaded rows would otherwise read as 0.
        const tables = await countMarks(closure.marks);
        await runDeletes(sql, closure.marks, steps);
        return {
          counts: {
            tables,
            removedUsers: closure.removedUserIds.length,
            keptUsers: closure.keptUserCount,
          },
          storageKeys: keys,
        };
      },
      TX_OPTIONS,
    );
    await this.deleteObjects(storageKeys);
    return counts;
  }

  private async deleteObjects(keys: string[]): Promise<void> {
    for (const key of keys) {
      try {
        await this.storage.delete(key);
      } catch (error) {
        this.logger.warn(
          `Could not delete stored object ${key}: ${String(error)}`,
        );
      }
    }
  }
}
