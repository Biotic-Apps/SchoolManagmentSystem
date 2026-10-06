import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

export type NameMap = Map<string, string>;

const toMap = (rows: { id: string; name: string }[]): NameMap =>
  new Map(rows.map((r) => [r.id, r.name]));

/** Display names for classes, sections, subjects and staff. */
@Injectable()
export class LookupService {
  constructor(private readonly prisma: PrismaService) {}

  async classes(ids: string[]): Promise<NameMap> {
    if (ids.length === 0) return new Map();
    return toMap(
      await this.prisma.schoolClass.findMany({
        where: { id: { in: [...new Set(ids)] } },
        select: { id: true, name: true },
      }),
    );
  }

  async sections(ids: string[]): Promise<NameMap> {
    if (ids.length === 0) return new Map();
    return toMap(
      await this.prisma.section.findMany({
        where: { id: { in: [...new Set(ids)] } },
        select: { id: true, name: true },
      }),
    );
  }

  async subjects(ids: string[]): Promise<NameMap> {
    if (ids.length === 0) return new Map();
    return toMap(
      await this.prisma.subject.findMany({
        where: { id: { in: [...new Set(ids)] } },
        select: { id: true, name: true },
      }),
    );
  }

  async staff(ids: (string | null)[]): Promise<NameMap> {
    const list = [...new Set(ids.filter((id): id is string => !!id))];
    if (list.length === 0) return new Map();
    return toMap(
      await this.prisma.staff.findMany({
        where: { id: { in: list } },
        select: { id: true, name: true },
      }),
    );
  }

  async users(ids: (string | null)[]): Promise<NameMap> {
    const list = [...new Set(ids.filter((id): id is string => !!id))];
    if (list.length === 0) return new Map();
    return toMap(
      await this.prisma.user.findMany({
        where: { id: { in: list } },
        select: { id: true, name: true },
      }),
    );
  }
}

export const idName = (map: NameMap, id: string | null) =>
  id ? { id, name: map.get(id) ?? '' } : null;
