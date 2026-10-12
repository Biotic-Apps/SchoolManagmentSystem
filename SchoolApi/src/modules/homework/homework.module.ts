import { Module } from '@nestjs/common';
import { HomeworkController } from './homework.controller';
import { HomeworkMapper } from './homework.mapper';
import { HomeworkService } from './homework.service';

@Module({
  controllers: [HomeworkController],
  providers: [HomeworkMapper, HomeworkService],
  exports: [HomeworkService],
})
export class HomeworkModule {}
