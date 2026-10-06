import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  DocumentOwnerRegistry,
  type DocumentOwner,
  type DocumentOwnerResolver,
  type OwnerAccess,
} from '../documents/document-owner.registry';
import { StaffAccessService } from './staff-access.service';

@Injectable()
export class StaffDocumentOwner implements DocumentOwnerResolver, OnModuleInit {
  readonly ownerType = 'STAFF' as const;
  readonly module = 'staff' as const;

  constructor(
    private readonly registry: DocumentOwnerRegistry,
    private readonly access: StaffAccessService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async resolve(
    scope: Scope,
    id: string,
    access: OwnerAccess,
  ): Promise<DocumentOwner> {
    const row =
      access === 'edit'
        ? await this.access.manage(scope, id)
        : await this.access.read(scope, id);
    return { schoolId: row.schoolId, branchId: row.branchId };
  }
}
