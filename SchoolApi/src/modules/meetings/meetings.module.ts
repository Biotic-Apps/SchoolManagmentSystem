import { Module } from '@nestjs/common';
import { FollowUpsController } from './follow-ups/follow-ups.controller';
import { FollowUpsService } from './follow-ups/follow-ups.service';
import { MeetingReminderProcessor } from './jobs/meeting-reminder.processor';
import { MeetingActionsService } from './meeting-actions.service';
import { MeetingNotifier } from './meeting-notifier';
import { MeetingRequestsController } from './meeting-requests.controller';
import { MeetingRequestsService } from './meeting-requests.service';
import { MeetingTeachersService } from './meeting-teachers.service';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { SlotBookingService } from './slot-booking.service';
import { SlotsController } from './slots/slots.controller';
import { SlotsService } from './slots/slots.service';

/** Parent-teacher meetings: slots, booking, requests, outcomes and follow-ups (Phase 3 §9). */
@Module({
  // Static `meetings/*` routes must register before MeetingsController's `:id`.
  controllers: [
    SlotsController,
    MeetingRequestsController,
    MeetingsController,
    FollowUpsController,
  ],
  providers: [
    SlotsService,
    SlotBookingService,
    MeetingsService,
    MeetingActionsService,
    MeetingTeachersService,
    MeetingRequestsService,
    MeetingNotifier,
    FollowUpsService,
    MeetingReminderProcessor,
  ],
})
export class MeetingsModule {}
