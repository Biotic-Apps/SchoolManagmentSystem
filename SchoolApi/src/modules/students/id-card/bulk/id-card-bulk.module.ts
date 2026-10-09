import { Module } from '@nestjs/common';
import { IdCardContentLoader } from '../id-card-content.loader';
import { IdCardBulkController } from './id-card-bulk.controller';
import { IdCardBulkService } from './id-card-bulk.service';
import { IdCardSheetProcessor } from './id-card-sheet.processor';

/** Bulk student ID cards: A4 sheets per section/class. */
@Module({
  controllers: [IdCardBulkController],
  providers: [IdCardContentLoader, IdCardBulkService, IdCardSheetProcessor],
  exports: [IdCardContentLoader],
})
export class IdCardBulkModule {}
