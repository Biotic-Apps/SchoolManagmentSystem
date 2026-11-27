import type { AuditService } from '../../../core/audit/audit.service';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { FileRefService } from '../../../core/files/file-ref.service';
import type { NotificationService } from '../../../core/notifications/notification.service';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { SchoolPeopleService } from '../../school-day/school-people.service';
import type { StudentPlacementService } from '../../school-day/student-placement.service';
import type { CreateIncidentDto } from '../dto/health-incident.dto';
import type { IncidentMapper } from './incident.mapper';
import { IncidentsService } from './incidents.service';

function setup() {
  const placements = { read: jest.fn().mockRejectedValue(new Error('next')) };
  const service = new IncidentsService(
    {} as PrismaService,
    placements as unknown as StudentPlacementService,
    {} as SchoolPeopleService,
    {} as FileRefService,
    {} as NotificationService,
    {} as AuditService,
    {} as IncidentMapper,
  );
  return { service, placements };
}

const USER = { id: 'u1', activeRole: 'TEACHER' } as AuthUser;
const SCOPE = { guardian: null } as unknown as Scope;
const dto = (occurredAt: string) =>
  ({
    studentId: 's1',
    occurredAt,
    type: 'INJURY',
    severity: 'MINOR',
    description: 'Fell in the yard',
    actionTaken: 'First aid',
  }) as unknown as CreateIncidentDto;

describe('IncidentsService.report occurredAt', () => {
  it('rejects an incident in the future', async () => {
    const { service, placements } = setup();
    await expect(
      service.report(USER, SCOPE, dto('2999-05-01T10:00:00+05:00')),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
    expect(placements.read).not.toHaveBeenCalled();
  });

  it('accepts an incident that already happened', async () => {
    const { service, placements } = setup();
    const earlier = new Date(Date.now() - 30 * 60_000).toISOString();
    await expect(service.report(USER, SCOPE, dto(earlier))).rejects.toThrow(
      'next',
    );
    expect(placements.read).toHaveBeenCalled();
  });
});
