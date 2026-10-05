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
