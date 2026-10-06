import { Injectable, OnModuleInit } from '@nestjs/common';
import type { DocumentStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  DocumentOwnerRegistry,
  type DocumentOwner,
  type DocumentOwnerResolver,
} from '../documents/document-owner.registry';
import { ApplicationAccessService } from './application-access.service';

/** A rejected document puts the application back to DOCUMENTS_PENDING. */
@Injectable()
export class ApplicationDocumentOwner
  implements DocumentOwnerResolver, OnModuleInit
{
  readonly ownerType = 'APPLICATION' as const;
  readonly module = 'admissions' as const;

  constructor(
    private readonly registry: DocumentOwnerRegistry,
    private readonly access: ApplicationAccessService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async resolve(scope: Scope, id: string): Promise<DocumentOwner> {
    const row = await this.access.load(scope, id);
    return { schoolId: row.schoolId, branchId: row.branchId };
  }

  async afterStatusChange(id: string, status: DocumentStatus): Promise<void> {
    if (status === 'REJECTED') {
      await this.prisma.admissionApplication.updateMany({
        where: { id, status: 'SUBMITTED' },
        data: { status: 'DOCUMENTS_PENDING' },
      });
    } else if (status === 'UPLOADED') {
      await this.prisma.admissionApplication.updateMany({
        where: { id, status: 'DOCUMENTS_PENDING' },
        data: { status: 'SUBMITTED' },
      });
    }
  }
}
