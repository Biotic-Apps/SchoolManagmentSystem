import { Module } from '@nestjs/common';
import { DeparturesController } from './departures/departures.controller';
import { DeparturesService } from './departures/departures.service';
import { EarlyLeaveApprovalHandler } from './early-leave/early-leave-approval.handler';
import { EarlyLeaveController } from './early-leave/early-leave.controller';
import { EarlyLeaveMapper } from './early-leave/early-leave.mapper';
import { EarlyLeaveService } from './early-leave/early-leave.service';
import { PickupPersonsController } from './persons/pickup-persons.controller';
import { PickupPersonsService } from './persons/pickup-persons.service';

/** Contract §11: pickup persons, early leave and gate departures. */
@Module({
  controllers: [
    PickupPersonsController,
    EarlyLeaveController,
    DeparturesController,
  ],
  providers: [
    PickupPersonsService,
    EarlyLeaveService,
    EarlyLeaveMapper,
    EarlyLeaveApprovalHandler,
    DeparturesService,
  ],
})
export class PickupModule {}
