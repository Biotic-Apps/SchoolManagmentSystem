import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivityAccessService } from './activity-access.service';
import { ActivityApprovalHandler } from './activity-approval.handler';
import { ActivityAudienceService } from './activity-audience.service';
import { ActivityLifecycleService } from './activity-lifecycle.service';
import { ActivityRosterController } from './activity-roster.controller';
import { ConsentsService } from './consents/consents.service';
import { MyActivitiesService } from './my-activities.service';
import { ParticipantsService } from './participants/participants.service';

/** Events, sports, trips: proposal → principal approval → consent → results. */
@Module({
  controllers: [ActivitiesController, ActivityRosterController],
  providers: [
    ActivitiesService,
    ActivityAccessService,
    ActivityAudienceService,
    ActivityApprovalHandler,
    ActivityLifecycleService,
    ConsentsService,
    ParticipantsService,
    MyActivitiesService,
  ],
  exports: [MyActivitiesService],
})
export class ActivitiesModule {}
