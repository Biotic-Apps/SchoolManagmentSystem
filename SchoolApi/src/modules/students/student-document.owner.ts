import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  DocumentOwnerRegistry,
  type DocumentOwner,
  type DocumentOwnerResolver,
  type OwnerAccess,
} from '../documents/document-owner.registry';
import { StudentAccessService } from './student-access.service';
import { currentEnrollment } from './student-scope';

@Injectable()
export class StudentDocumentOwner
  implements DocumentOwnerResolver, OnModuleInit
{
  readonly ownerType = 'STUDENT' as const;
  readonly module = 'students' as const;

  constructor(
    private readonly registry: DocumentOwnerRegistry,
    private readonly access: StudentAccessService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async resolve(
    scope: Scope,
    studentId: string,
    access: OwnerAccess,
  ): Promise<DocumentOwner> {
    const row =
      access === 'edit'
        ? await this.access.manage(scope, studentId)
        : await this.access.read(scope, studentId);
    return {
      schoolId: row.schoolId,
      branchId: currentEnrollment(row.enrollments)?.branchId ?? null,
    };
  }
}
