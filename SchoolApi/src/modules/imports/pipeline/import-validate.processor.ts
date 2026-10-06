import { Injectable, OnModuleInit } from '@nestjs/common';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../core/jobs/queues';
import { ImportValidationService } from './import-validation.service';

export const VALIDATE_IMPORT_JOB = 'imports.validate';

export interface ValidateImportJob {
  importId: string;
}

/** Validates an uploaded import file (status VALIDATING → READY/INVALID). */
@Injectable()
export class ImportValidateProcessor
  implements JobProcessor<ValidateImportJob>, OnModuleInit
{
  readonly queue = QUEUES.IMPORTS;
  readonly name = VALIDATE_IMPORT_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly validation: ImportValidationService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  process(data: ValidateImportJob): Promise<void> {
    return this.validation.run(data.importId);
  }
}
