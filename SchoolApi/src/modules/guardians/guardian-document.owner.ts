import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  DocumentOwnerRegistry,
  type DocumentOwner,
  type DocumentOwnerResolver,
  type OwnerAccess,
} from '../documents/document-owner.registry';
import { GuardianAccessService } from './guardian-access.service';

@Injectable()
export class GuardianDocumentOwner
  implements DocumentOwnerResolver, OnModuleInit
{
  readonly ownerType = 'GUARDIAN' as const;
  readonly module = 'guardians' as const;

  constructor(
    private readonly registry: DocumentOwnerRegistry,
    private readonly access: GuardianAccessService,
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
    return { schoolId: row.schoolId, branchId: null };
  }
}
