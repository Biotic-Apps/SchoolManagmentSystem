import { Module } from '@nestjs/common';
import { StaffModule } from '../staff/staff.module';
import { ClassSetupController } from './class-setup/class-setup.controller';
import { ClassSetupRepository } from './class-setup/class-setup.repository';
import { ClassSetupService } from './class-setup/class-setup.service';
import { ClassCurriculumRepository } from './classes/class-curriculum.repository';
import { ClassCurriculumService } from './classes/class-curriculum.service';
import { ClassesController } from './classes/classes.controller';
import { ClassesRepository } from './classes/classes.repository';
import { ClassesService } from './classes/classes.service';
import { RoomsController } from './rooms/rooms.controller';
import { RoomsRepository } from './rooms/rooms.repository';
import { RoomsService } from './rooms/rooms.service';
import { SchoolDataAccess } from './school-data-access';
import { SectionsController } from './sections/sections.controller';
import { SectionsRepository } from './sections/sections.repository';
import { SectionsService } from './sections/sections.service';
import { SubjectsController } from './subjects/subjects.controller';
import { SubjectsRepository } from './subjects/subjects.repository';
import { SubjectsService } from './subjects/subjects.service';

@Module({
  imports: [StaffModule],
  controllers: [
    ClassSetupController,
    ClassesController,
    SubjectsController,
    RoomsController,
    SectionsController,
  ],
  providers: [
    SchoolDataAccess,
    ClassesRepository,
    ClassesService,
    ClassCurriculumRepository,
    ClassCurriculumService,
    ClassSetupRepository,
    ClassSetupService,
    SubjectsRepository,
    SubjectsService,
    RoomsRepository,
    RoomsService,
    SectionsRepository,
    SectionsService,
  ],
  exports: [
    ClassesRepository,
    SubjectsRepository,
    SectionsRepository,
    ClassSetupService,
  ],
})
export class AcademicsModule {}
