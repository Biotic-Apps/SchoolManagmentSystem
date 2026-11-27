import type { AuditService } from '../../../core/audit/audit.service';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { StudentPlacementService } from '../../school-day/student-placement.service';
import { HealthProfileService } from './health-profile.service';

const ROW = {
  studentId: 's1',
  bloodGroup: 'B+',
  allergyList: [{ name: 'Peanuts', severity: 'SEVERE', reaction: null }],
  conditionList: ['Asthma'],
  medications: [{ name: 'Ventolin', dose: null, schedule: null }],
  instructions: 'Inhaler in bag',
  doctor: { name: 'Dr. Ali', phone: '+923001234567' },
  emergencyContacts: [
    { name: 'Uncle', relation: 'Uncle', phone: '+923001112223', priority: 1 },
  ],
  updatedAt: new Date('2026-10-01T00:00:00.000Z'),
};

function setup() {
  const prisma = {
    studentHealthProfile: { findUnique: jest.fn().mockResolvedValue(ROW) },
  };
  const placements = {
    read: jest.fn().mockResolvedValue({ schoolId: 'sc', branchId: 'b' }),
  };
  const audit = { recordNow: jest.fn() };
  const service = new HealthProfileService(
    prisma as unknown as PrismaService,
    placements as unknown as StudentPlacementService,
    audit as unknown as AuditService,
  );
  return { service, audit };
}

const as = (activeRole: string) => ({ id: 'u1', activeRole }) as AuthUser;
const scope = {} as Scope;

describe('HealthProfileService.read', () => {
  it.each(['TEACHER', 'HELPER'])(
    'gives a %s allergies and instructions only',
    async (role) => {
      const { service, audit } = setup();
      const view = await service.read(as(role), scope, 's1');
      expect(view.allergies).toHaveLength(1);
      expect(view.instructions).toBe('Inhaler in bag');
      expect(view).toMatchObject({
        bloodGroup: null,
        conditions: [],
        medications: [],
        doctor: null,
        emergencyContacts: [],
      });
      expect(audit.recordNow).toHaveBeenCalled();
    },
  );

  it.each(['PRINCIPAL', 'COORDINATOR', 'PARENT'])(
    'gives a %s the full profile',
    async (role) => {
      const { service } = setup();
      const view = await service.read(as(role), scope, 's1');
      expect(view.bloodGroup).toBe('B+');
      expect(view.conditions).toEqual(['Asthma']);
      expect(view.medications).toHaveLength(1);
      expect(view.emergencyContacts).toHaveLength(1);
    },
  );
});
