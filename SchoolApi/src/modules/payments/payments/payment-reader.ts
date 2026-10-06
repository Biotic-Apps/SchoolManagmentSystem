import { Injectable } from '@nestjs/common';
import { notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type { PaymentDto } from './dto/payment.dto';
import {
  PAYMENT_INCLUDE,
  toPaymentDto,
  type PaymentRow,
} from './payment.mapper';

/** Loads payments with what the DTO needs (student, allocations, cashier name). */
@Injectable()
export class PaymentReader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly people: SchoolPeopleService,
  ) {}

  async row(id: string): Promise<PaymentRow> {
    const row = await this.prisma.payment.findUnique({
      where: { id },
      include: PAYMENT_INCLUDE,
    });
    if (!row) throw notFound('Payment');
    return row;
  }

  async dto(id: string): Promise<PaymentDto> {
    const [dto] = await this.dtos([await this.row(id)]);
    return dto;
  }

  async dtos(rows: PaymentRow[]): Promise<PaymentDto[]> {
    const names = await this.people.names(rows.map((r) => r.receivedById));
    return rows.map((row) => toPaymentDto(row, names));
  }
}
