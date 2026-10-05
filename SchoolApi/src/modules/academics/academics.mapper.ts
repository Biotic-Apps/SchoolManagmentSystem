import type { Room, Subject } from '../../generated/prisma/client';
import type { RoomDto } from './dto/room.dto';
import type { SchoolClassDto } from './dto/school-class.dto';
import type { SubjectDto } from './dto/subject.dto';
import type { ClassRow } from './classes/classes.repository';

export const toClassDto = (row: ClassRow): SchoolClassDto => ({
  id: row.id,
  schoolId: row.schoolId,
  name: row.name,
  levelOrder: row.levelOrder,
  subjectCount: row._count.subjects,
});

export const toSubjectDto = (row: Subject): SubjectDto => ({
  id: row.id,
  schoolId: row.schoolId,
  code: row.code,
  name: row.name,
});

export const toRoomDto = (row: Room): RoomDto => ({
  id: row.id,
  branchId: row.branchId,
  name: row.name,
  capacity: row.capacity,
});
