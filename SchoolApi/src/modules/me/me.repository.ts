import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

const USER_FIELDS = {
  id: true,
  name: true,
  email: true,
  phone: true,
  mustChangePassword: true,
} as const;

@Injectable()
export class MeRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUser(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: USER_FIELDS,
    });
  }

  /** Children through VERIFIED guardian links, with the current enrollment. */
  children(userId: string) {
    return this.prisma.student.findMany({
      where: {
        guardianLinks: {
          some: { status: 'VERIFIED', guardian: { userId, status: 'ACTIVE' } },
        },
      },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            branch: { select: { name: true } },
            session: { select: { name: true } },
            section: {
              select: { name: true, schoolClass: { select: { name: true } } },
            },
          },
          take: 1,
        },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  }

  updateUser(
    id: string,
    data: { name?: string; email?: string; phone?: string },
  ) {
    return this.prisma.user.update({
      where: { id },
      data: { ...data, updatedById: id },
      select: USER_FIELDS,
    });
  }
}
