import { Injectable } from '@nestjs/common';
import type { ApplicationStatus } from '../../generated/prisma/client';
import {
  conflict,
  forbiddenScope,
  notFound,
} from '../../core/common/errors/errors';
import type { Scope } from '../../core/rbac/scope/scope';
import { DocumentsService } from '../documents/documents.service';
import { toApplicationDto } from './application.mapper';
import {
  ApplicationsRepository,
  type ApplicationRow,
} from './applications.repository';
import type { ApplicationDto } from './dto/application.dto';

@Injectable()
export class ApplicationAccessService {
  constructor(
    private readonly repository: ApplicationsRepository,
    private readonly documents: DocumentsService,
  ) {}

  async load(scope: Scope, id: string): Promise<ApplicationRow> {
    const row = await this.repository.findById(id);
    if (!row) throw notFound('Application');
    if (!scope.canManageBranch({ id: row.branchId, schoolId: row.schoolId }))
      throw forbiddenScope();
    return row;
  }

  async loadIn(
    scope: Scope,
    id: string,
    allowed: ApplicationStatus[],
  ): Promise<ApplicationRow> {
    const row = await this.load(scope, id);
    if (!allowed.includes(row.status))
      throw conflict(`Not allowed while application is ${row.status}`);
    return row;
  }

  async toDto(row: ApplicationRow): Promise<ApplicationDto> {
    return toApplicationDto(
      row,
      await this.documents.listForOwner('APPLICATION', row.id),
    );
  }
}
