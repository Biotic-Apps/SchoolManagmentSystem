import { Module } from '@nestjs/common';
import { HealthAlertsService } from './alerts/health-alerts.service';
import { HealthChangeHandler } from './change-request/health-change.handler';
import { HealthChangeService } from './change-request/health-change.service';
import { IncidentMapper } from './incidents/incident.mapper';
import { IncidentsController } from './incidents/incidents.controller';
import { IncidentsService } from './incidents/incidents.service';
import { HealthProfileController } from './profile/health-profile.controller';
import { HealthProfileService } from './profile/health-profile.service';

/** Contract §10: student health profiles, alerts and incidents. */
@Module({
  controllers: [HealthProfileController, IncidentsController],
  providers: [
    HealthProfileService,
    HealthChangeService,
    HealthChangeHandler,
    HealthAlertsService,
    IncidentsService,
    IncidentMapper,
  ],
})
export class StudentHealthModule {}
