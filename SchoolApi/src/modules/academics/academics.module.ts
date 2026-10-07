import { Module } from '@nestjs/common';
import { ClassesController } from './classes/classes.controller';
import { ClassesRepository } from './classes/classes.repository';
import { ClassesService } from './classes/classes.service';
import { RoomsController } from './rooms/rooms.controller';
import { RoomsRepository } from './rooms/rooms.repository';
import { RoomsService } from './rooms/rooms.service';
import { SectionsController } from './sections/sections.controller';
import { SectionsRepository } from './sections/sections.repository';
import { SectionsService } from './sections/sections.service';
import { SubjectsController } from './subjects/subjects.controller';
import { SubjectsRepository } from './subjects/subjects.repository';
import { SubjectsService } from './subjects/subjects.service';

@Module({
  controllers: [
    ClassesController,
    SubjectsController,
    RoomsController,
    SectionsController,
  ],
  providers: [
    ClassesRepository,
    ClassesService,
    SubjectsRepository,
    SubjectsService,
    RoomsRepository,
    RoomsService,
    SectionsRepository,
    SectionsService,
  ],
  exports: [ClassesRepository, SubjectsRepository, SectionsRepository],
})
export class AcademicsModule {}
