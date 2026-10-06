import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { normalizePhone } from '../../../core/auth/identifier';
import { invalid } from '../../../core/common/errors/errors';
import type {
  GuardianInputDto,
  PrimaryGuardianInputDto,
} from '../dto/guardian-input.dto';

export interface AttachGuardiansInput {
  schoolId: string;
  studentId: string;
  guardians: PrimaryGuardianInputDto[];
  actorId: string;
}

export function assertOnePrimary(
  guardians: { isPrimary: boolean; phone: string }[],
): void {
  if (guardians.filter((g) => g.isPrimary).length !== 1)
    throw invalid('Exactly one guardian must be primary');
  const phones = guardians.map((g) => normalizePhone(g.phone));
  if (new Set(phones).size !== phones.length)
    throw invalid('Guardians must have different phone numbers');
}

/** Finds guardians by phone within the school (siblings) or creates them. */
@Injectable()
export class GuardianWriter {
  async findOrCreate(
    tx: Prisma.TransactionClient,
    schoolId: string,
    input: GuardianInputDto,
    actorId: string,
  ) {
    const phone = normalizePhone(input.phone);
    const existing = await tx.guardian.findFirst({
      where: { schoolId, phone, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });
    if (existing) return existing;
    return tx.guardian.create({
      data: {
        schoolId,
        name: input.name.trim(),
        relation: input.relation,
        cnic: input.cnic,
        phone,
        email: input.email?.toLowerCase(),
        occupation: input.occupation,
        address: input.address,
        createdById: actorId,
      },
    });
  }

  /** Staff-entered guardians are linked VERIFIED at once. Returns their user ids. */
  async attachVerified(
    tx: Prisma.TransactionClient,
    input: AttachGuardiansInput,
  ): Promise<string[]> {
    assertOnePrimary(input.guardians);
    const userIds: string[] = [];
    for (const entry of input.guardians) {
      const guardian = await this.findOrCreate(
        tx,
        input.schoolId,
        entry,
        input.actorId,
      );
      await tx.studentGuardian.create({
        data: {
          schoolId: input.schoolId,
          studentId: input.studentId,
          guardianId: guardian.id,
          relation: entry.relation,
          isPrimary: entry.isPrimary,
          status: 'VERIFIED',
          verifiedById: input.actorId,
          verifiedAt: new Date(),
          createdById: input.actorId,
        },
      });
      if (guardian.userId) userIds.push(guardian.userId);
    }
    return userIds;
  }
}
