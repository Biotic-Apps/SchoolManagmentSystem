import { Module } from '@nestjs/common';
import { AcademicSessionsModule } from '../academic-sessions/academic-sessions.module';
import { AcademicsModule } from '../academics/academics.module';
import { BranchesModule } from '../branches/branches.module';
import { SchoolsModule } from '../schools/schools.module';
import { SettingsModule } from '../settings/settings.module';
import { UsersModule } from '../users/users.module';
import { ChecklistController } from './checklist/checklist.controller';
import { ChecklistRepository } from './checklist/checklist.repository';
import { ChecklistService } from './checklist/checklist.service';
import { PresetsController } from './presets.controller';
import { SchoolSetupController } from './school-setup.controller';
import { SchoolSetupService } from './school-setup.service';
import { AcademicsStep } from './steps/academics.step';
import { OrganisationStep } from './steps/organisation.step';
import { PrincipalStep } from './steps/principal.step';
import { WelcomeNotifier } from './welcome-notifier';

/** school-setup-contract §1–2: one-form provisioning and the setup checklist. */
@Module({
  imports: [
    SchoolsModule,
    BranchesModule,
    UsersModule,
    AcademicSessionsModule,
    AcademicsModule,
    SettingsModule,
  ],
  controllers: [SchoolSetupController, ChecklistController, PresetsController],
  providers: [
    SchoolSetupService,
    OrganisationStep,
    PrincipalStep,
    AcademicsStep,
    WelcomeNotifier,
    ChecklistRepository,
    ChecklistService,
  ],
})
export class SchoolSetupModule {}
