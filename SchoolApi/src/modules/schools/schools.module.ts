import { Module } from '@nestjs/common';
import { SchoolDeletionController } from './deletion/school-deletion.controller';
import { SchoolDeletionProcessor } from './deletion/school-deletion.processor';
import { SchoolDeletionService } from './deletion/school-deletion.service';
import { SchoolPurgeService } from './deletion/school-purge.service';
import { SchoolsController } from './schools.controller';
import { SchoolsRepository } from './schools.repository';
import { SchoolsService } from './schools.service';

@Module({
  controllers: [SchoolsController, SchoolDeletionController],
  providers: [
    SchoolsRepository,
    SchoolsService,
    SchoolPurgeService,
    SchoolDeletionService,
    SchoolDeletionProcessor,
  ],
  exports: [SchoolsRepository],
})
export class SchoolsModule {}
