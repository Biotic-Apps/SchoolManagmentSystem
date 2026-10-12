import { Module } from '@nestjs/common';
import { StaffIdCardContentLoader } from '../staff-id-card-content.loader';
import { StaffIdCardBulkController } from './staff-id-card-bulk.controller';
import { StaffIdCardBulkService } from './staff-id-card-bulk.service';
import { StaffIdCardSheetProcessor } from './staff-id-card-sheet.processor';

/** Bulk staff ID cards: A4 sheets per branch. */
@Module({
  controllers: [StaffIdCardBulkController],
  providers: [
    StaffIdCardContentLoader,
    StaffIdCardBulkService,
    StaffIdCardSheetProcessor,
  ],
})
export class StaffIdCardBulkModule {}
