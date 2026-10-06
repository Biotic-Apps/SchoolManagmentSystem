import { Injectable } from '@nestjs/common';
import type { PickupPerson } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { normalizePhone } from '../../../core/auth/identifier';
import {
  conflict,
  forbidden,
  forbiddenScope,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { FileRefService } from '../../../core/files/file-ref.service';
import { UrlSigner } from '../../../core/files/url-signer';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { StudentPlacementService } from '../../school-day/student-placement.service';
import type { AddPickupPersonDto, PickupPersonDto } from '../dto/pickup.dto';
import { normaliseCnic, toPickupPersonDto } from './pickup-person.mapper';

/** Contract §11: parent-added pickup persons verified by the office. */
@Injectable()
export class PickupPersonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placements: StudentPlacementService,
    private readonly people: SchoolPeopleService,
    private readonly files: FileRefService,
    private readonly signer: UrlSigner,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async list(
    user: AuthUser,
    scope: Scope,
    studentId: string,
  ): Promise<PickupPersonDto[]> {
    await this.placements.read(scope, studentId);
    const rows = await this.prisma.pickupPerson.findMany({
      where: { studentId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.toDto(user, row));
  }

  async add(
    user: AuthUser,
    scope: Scope,
    studentId: string,
    dto: AddPickupPersonDto,
  ): Promise<PickupPersonDto> {
    if (!scope.guardian) throw forbidden('Only parents add pickup persons');
    const placement = await this.placements.read(scope, studentId);
    if (dto.photoFileId) {
      await this.files.assertUsable(dto.photoFileId, {
        schoolId: placement.schoolId,
        userId: user.id,
        purposes: ['ATTACHMENT', 'DOCUMENT', 'STUDENT_PHOTO'],
      });
    }
    const row = await this.prisma.pickupPerson.create({
      data: {
        schoolId: placement.schoolId,
        studentId,
        name: dto.name,
        relation: dto.relation,
        cnic: normaliseCnic(dto.cnic),
        phone: normalizePhone(dto.phone),
        photoFileId: dto.photoFileId ?? null,
        addedById: user.id,
      },
    });
    this.audit.stage({
      action: 'pickup.person_add',
      entityType: 'PickupPerson',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: placement.branchId,
      after: { studentId, name: row.name, relation: row.relation },
    });
    const principal = await this.people.principalOf(placement.branchId);
    await this.notifications.notify({
      userIds: principal ? [principal] : [],
      category: 'PICKUP',
      title: 'Pickup person to verify',
      body: `${row.name} (${row.relation}) for ${placement.name}`,
      data: { pickupPersonId: row.id, studentId },
      silent: true,
    });
    return this.toDto(user, row);
  }

  verify(user: AuthUser, scope: Scope, id: string): Promise<PickupPersonDto> {
    return this.transition(user, scope, id, 'VERIFIED');
  }

  revoke(user: AuthUser, scope: Scope, id: string): Promise<PickupPersonDto> {
    return this.transition(user, scope, id, 'REVOKED');
  }

  private async transition(
    user: AuthUser,
    scope: Scope,
    id: string,
    status: 'VERIFIED' | 'REVOKED',
  ): Promise<PickupPersonDto> {
    const person = await this.prisma.pickupPerson.findUnique({ where: { id } });
    if (!person) throw notFound('Pickup person');
    const placement = await this.placements.find(person.studentId);
    if (!placement) throw notFound('Student');
    if (
      !scope.canManageBranch({
        id: placement.branchId,
        schoolId: placement.schoolId,
      })
    )
      throw forbiddenScope();
    if (person.status === status || person.status === 'REVOKED')
      throw conflict(`Pickup person is already ${person.status.toLowerCase()}`);
    const now = new Date();
    const row = await this.prisma.pickupPerson.update({
      where: { id },
      data:
        status === 'VERIFIED'
          ? { status, verifiedById: user.id, verifiedAt: now }
          : { status, revokedAt: now },
    });
    this.audit.stage({
      action:
        status === 'VERIFIED' ? 'pickup.person_verify' : 'pickup.person_revoke',
      entityType: 'PickupPerson',
      entityId: id,
      schoolId: row.schoolId,
      branchId: placement.branchId,
      before: { status: person.status },
      after: { status: row.status },
    });
    const guardians = await this.people.guardianUserIds([row.studentId]);
    await this.notifications.notify({
      userIds: guardians,
      category: 'PICKUP',
      title: `Pickup person ${status === 'VERIFIED' ? 'verified' : 'revoked'}`,
      body: `${row.name} for ${placement.name}`,
      data: { pickupPersonId: id, studentId: row.studentId },
    });
    return this.toDto(user, row);
  }

  private toDto(user: AuthUser, row: PickupPerson): PickupPersonDto {
    return toPickupPersonDto(
      row,
      this.signer,
      user.permissions.has('people.sensitive.view'),
    );
  }
}
