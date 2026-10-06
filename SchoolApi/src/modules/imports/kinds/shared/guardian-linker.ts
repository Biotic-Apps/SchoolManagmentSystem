import { Injectable } from '@nestjs/common';
import type {
  Guardian,
  GuardianRelation,
} from '../../../../generated/prisma/client';
import { GuardianWriter } from '../../../students/registration/guardian-writer';
import { phoneVariants } from '../../validation/fields';
import type { Db, ImportTarget } from '../kind-handler';

export interface GuardianFields {
  name: string;
  relation: GuardianRelation;
  phone: string;
  cnic: string | null;
  email: string | null;
}

/** Active guardian of the school with this CNIC, else this phone. */
export async function findGuardian(
  db: Db,
  schoolId: string,
  key: { cnic: string | null; phone: string | null },
): Promise<Guardian | null> {
  if (key.cnic) {
    const byCnic = await db.guardian.findFirst({
      where: { schoolId, status: 'ACTIVE', cnic: key.cnic },
      orderBy: { createdAt: 'asc' },
    });
    if (byCnic) return byCnic;
  }
  if (!key.phone) return null;
  return db.guardian.findFirst({
    where: {
      schoolId,
      status: 'ACTIVE',
      phone: { in: phoneVariants(key.phone) },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export interface LinkInput {
  studentId: string;
  guardian: GuardianFields;
  relation: GuardianRelation;
  isPrimary: boolean;
}

export interface Linked {
  guardian: Guardian;
  guardianId: string;
  guardianCreated: boolean;
  linkId: string;
}

/** Reuses (CNIC/phone) or creates the guardian, then links it VERIFIED. */
@Injectable()
export class GuardianLinker {
  constructor(private readonly writer: GuardianWriter) {}

  async link(tx: Db, target: ImportTarget, input: LinkInput): Promise<Linked> {
    const g = input.guardian;
    const existing = await findGuardian(tx, target.schoolId, g);
    const guardian =
      existing ??
      (await this.writer.findOrCreate(
        tx,
        target.schoolId,
        {
          name: g.name,
          relation: g.relation,
          phone: g.phone,
          cnic: g.cnic ?? undefined,
          email: g.email ?? undefined,
        },
        target.actorId,
      ));
    const link = await tx.studentGuardian.create({
      data: {
        schoolId: target.schoolId,
        studentId: input.studentId,
        guardianId: guardian.id,
        relation: input.relation,
        isPrimary: input.isPrimary,
        status: 'VERIFIED',
        verifiedById: target.actorId,
        verifiedAt: new Date(),
        createdById: target.actorId,
      },
    });
    return {
      guardian,
      guardianId: guardian.id,
      guardianCreated: !existing,
      linkId: link.id,
    };
  }
}
