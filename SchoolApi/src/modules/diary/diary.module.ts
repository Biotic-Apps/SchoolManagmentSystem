import { Module } from '@nestjs/common';
import { DiaryAccessService } from './diary-access.service';
import { DiaryMissingService } from './diary-missing.service';
import { DiaryModerationHandler } from './diary-moderation.handler';
import { DiaryPublishAction } from './diary-publish.action';
import { DiaryPublishService } from './diary-publish.service';
import { DiaryPublisher } from './diary-publisher';
import { DiaryController } from './diary.controller';
import { DiaryMapper } from './diary.mapper';
import { DiaryService } from './diary.service';
import { DiaryMissingCheckProcessor } from './jobs/diary-missing-check.processor';

@Module({
  controllers: [DiaryController],
  providers: [
    DiaryMapper,
    DiaryAccessService,
    DiaryPublisher,
    DiaryPublishAction,
    DiaryModerationHandler,
    DiaryService,
    DiaryPublishService,
    DiaryMissingService,
    DiaryMissingCheckProcessor,
  ],
  exports: [DiaryService, DiaryMissingService],
})
export class DiaryModule {}
