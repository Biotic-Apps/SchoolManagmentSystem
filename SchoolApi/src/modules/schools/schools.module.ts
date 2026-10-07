import { Module } from '@nestjs/common';
import { SchoolsController } from './schools.controller';
import { SchoolsRepository } from './schools.repository';
import { SchoolsService } from './schools.service';

@Module({
  controllers: [SchoolsController],
  providers: [SchoolsRepository, SchoolsService],
  exports: [SchoolsRepository],
})
export class SchoolsModule {}
