import { Module } from '@nestjs/common';
import { StudentsModule } from '../students/students.module';
import { ImportAccessService } from './import-access.service';
import { ImportCommitService } from './import-commit.service';
import { ImportRevertService } from './import-revert.service';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { IMPORT_KIND_PROVIDERS, ImportKinds } from './kinds/import-kinds';
import { GuardianLinker } from './kinds/shared/guardian-linker';
import { ImportAccounts } from './kinds/shared/import-accounts';
import { ImportValidateProcessor } from './pipeline/import-validate.processor';
import { ImportValidationService } from './pipeline/import-validation.service';

/** Phase 5 §E: XLSX/CSV import of students, guardians, staff, balances, plans. */
@Module({
  imports: [StudentsModule],
  controllers: [ImportsController],
  providers: [
    ImportsService,
    ImportAccessService,
    ImportCommitService,
    ImportRevertService,
    ImportValidationService,
    ImportValidateProcessor,
    ImportKinds,
    GuardianLinker,
    ImportAccounts,
    ...IMPORT_KIND_PROVIDERS,
  ],
})
export class ImportsModule {}
