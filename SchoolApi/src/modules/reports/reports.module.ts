import { Module } from '@nestjs/common';
import { ReportProcessor } from './jobs/report.processor';
import { ReportFileWriter } from './report-file.writer';
import { ReportScopeService } from './report-scope.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

/** §G report catalog and CSV/XLSX/PDF exports on the `reports` queue. */
@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportScopeService,
    ReportFileWriter,
    ReportProcessor,
  ],
})
export class ReportsModule {}
