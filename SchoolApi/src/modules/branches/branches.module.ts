import { Module } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { BranchesRepository } from './branches.repository';
import { BranchesService } from './branches.service';
import { PrincipalRepository } from './principal/principal.repository';
import { PrincipalService } from './principal/principal.service';
import { BranchSettingsReader } from './settings/branch-settings.reader';
import { BranchSettingsRepository } from './settings/branch-settings.repository';
import { BranchSettingsService } from './settings/branch-settings.service';

@Module({
  controllers: [BranchesController],
  providers: [
    BranchesRepository,
    BranchesService,
    BranchSettingsRepository,
    BranchSettingsService,
    BranchSettingsReader,
    PrincipalRepository,
    PrincipalService,
  ],
  exports: [
    BranchesService,
    BranchSettingsReader,
    BranchesRepository,
    BranchSettingsRepository,
    PrincipalRepository,
  ],
})
export class BranchesModule {}
