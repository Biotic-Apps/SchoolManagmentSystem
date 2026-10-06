import { Module } from '@nestjs/common';
import { BackupAlerts } from './backup-alerts';
import { BackupGuard } from './backup-guard';
import { BackupRunner } from './backup-runner';
import { BackupUrlSigner } from './backup-url-signer';
import { BackupsController } from './backups.controller';
import { BackupsQuery } from './backups.query';
import { BackupsService } from './backups.service';
import { BackupScheduledWork } from './jobs/backup-scheduled-work';
import {
  BackupNightlyProcessor,
  BackupVerifyWeeklyProcessor,
} from './jobs/backup-schedules.processor';
import { BackupVerifyProcessor } from './jobs/backup-verify.processor';
import { BackupProcessor } from './jobs/backup.processor';
import { BackupRetention } from './retention/backup-retention';
import { BackupVerifier } from './verify/backup-verifier';

/** Phase 5 §D: encrypted backups, retention and restore verification. */
@Module({
  controllers: [BackupsController],
  providers: [
    BackupAlerts,
    BackupGuard,
    BackupRunner,
    BackupVerifier,
    BackupRetention,
    BackupUrlSigner,
    BackupsQuery,
    BackupsService,
    BackupScheduledWork,
    BackupProcessor,
    BackupVerifyProcessor,
    BackupNightlyProcessor,
    BackupVerifyWeeklyProcessor,
  ],
  exports: [BackupsQuery],
})
export class BackupsModule {}
