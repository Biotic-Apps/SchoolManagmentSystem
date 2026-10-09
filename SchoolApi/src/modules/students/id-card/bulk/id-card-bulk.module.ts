import { Module } from '@nestjs/common';
import { PrintRosterService } from '../../print-roster/print-roster.service';
import { IdCardContentLoader } from '../id-card-content.loader';
import { IdCardBulkController } from './id-card-bulk.controller';
import { IdCardBulkService } from './id-card-bulk.service';
import { IdCardSheetProcessor } from './id-card-sheet.processor';

/** Bulk student ID cards: A4 sheets per section/class. */
@Module({
  controllers: [IdCardBulkController],
  providers: [
    IdCardContentLoader,
    PrintRosterService,
    IdCardBulkService,
    IdCardSheetProcessor,
  ],
  exports: [IdCardContentLoader, PrintRosterService],
})
export class IdCardBulkModule {}
