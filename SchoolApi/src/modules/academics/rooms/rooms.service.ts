import { Injectable } from '@nestjs/common';
import type { Room } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import {
  domainError,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import { toPageResult } from '../../../core/common/pagination/paginate';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { Scope } from '../../../core/rbac/scope/scope';
import { toRoomDto } from '../academics.mapper';
import type { BranchScopedQueryDto } from '../dto/branch-scoped-query.dto';
import type { CreateRoomDto } from '../dto/create-room.dto';
import type { RoomDto } from '../dto/room.dto';
import type { UpdateRoomDto } from '../dto/update-room.dto';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import { RoomsRepository } from './rooms.repository';

const roomNameTaken = (name: string) => (error: unknown) => {
  if ((error as { code?: string }).code === 'P2002')
    throw domainError(
      ErrorCode.ROOM_NAME_TAKEN,
      `Room ${name.trim()} already exists in this branch`,
      { field: 'name' },
    );
  throw error;
};

@Injectable()
export class RoomsService {
  constructor(
    private readonly repository: RoomsRepository,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: BranchScopedQueryDto,
  ): Promise<PageResult<RoomDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(rows.map(toRoomDto), total, query);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateRoomDto,
  ): Promise<RoomDto> {
    const branch = await this.repository.findBranch(dto.branchId);
    if (!branch) throw invalid('Branch does not exist');
    scope.assertManageBranch(branch);
    const row = await this.repository
      .create({
        schoolId: branch.schoolId,
        branchId: branch.id,
        name: dto.name.trim(),
        capacity: dto.capacity,
        createdById: user.id,
      })
      .catch(roomNameTaken(dto.name));
    return this.audited('room.create', undefined, row);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateRoomDto,
  ): Promise<RoomDto> {
    const before = await this.repository.findById(id);
    if (!before) throw notFound('Room');
    scope.assertManageBranch({
      id: before.branchId,
      schoolId: before.schoolId,
    });
    const row = await this.repository
      .update(id, {
        name: dto.name?.trim(),
        capacity: dto.capacity,
        updatedById: user.id,
      })
      .catch(roomNameTaken(dto.name ?? before.name));
    return this.audited('room.update', before, row);
  }

  private audited(
    action: string,
    before: Room | undefined,
    after: Room,
  ): RoomDto {
    const dto = toRoomDto(after);
    this.audit.stage({
      action,
      entityType: 'Room',
      entityId: after.id,
      schoolId: after.schoolId,
      branchId: after.branchId,
      before: before && toRoomDto(before),
      after: dto,
    });
    return dto;
  }
}
