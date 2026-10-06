import { Injectable } from '@nestjs/common';
import type {
  DocumentOwnerType,
  DocumentStatus,
} from '../../generated/prisma/client';
import type { Scope } from '../../core/rbac/scope/scope';

export interface DocumentOwner {
  schoolId: string;
  branchId: string | null;
}

export type OwnerAccess = 'view' | 'edit';

/** Registered by the module that owns a document owner type. */
export interface DocumentOwnerResolver {
  readonly ownerType: DocumentOwnerType;
  /** Permission module checked for view/edit (e.g. `students`). */
  readonly module: 'students' | 'guardians' | 'staff' | 'admissions';
  /** Throws NOT_FOUND / FORBIDDEN_SCOPE when the owner is out of reach. */
  resolve(
    scope: Scope,
    ownerId: string,
    access: OwnerAccess,
  ): Promise<DocumentOwner>;
  afterStatusChange?(ownerId: string, status: DocumentStatus): Promise<void>;
}

@Injectable()
export class DocumentOwnerRegistry {
  private readonly resolvers = new Map<
    DocumentOwnerType,
    DocumentOwnerResolver
  >();

  register(resolver: DocumentOwnerResolver): void {
    this.resolvers.set(resolver.ownerType, resolver);
  }

  get(ownerType: DocumentOwnerType): DocumentOwnerResolver {
    const resolver = this.resolvers.get(ownerType);
    if (!resolver)
      throw new Error(`No document owner resolver for ${ownerType}`);
    return resolver;
  }
}
