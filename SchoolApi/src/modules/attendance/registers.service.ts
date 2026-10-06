import { Injectable } from '@nestjs/common';
import type { Section } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { parseDate } from '../../core/common/dates';
import { AppError } from '../../core/common/errors/app-error';
import { ErrorCode } from '../../core/common/errors/error-code.enum';
import { forbidden, invalid } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { today } from '../../core/common/week';
import { ClientRequestService } from '../../core/idempotency/client-request.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ProbationGate } from '../../core/probation/probation-gate';
import type { Scope } from '../../core/rbac/scope/scope';
import { WorkingDayService } from '../school-day/working-day.service';
import type {
  EntryInputDto,
  SaveRegisterDto,
  SubmitRegisterDto,
} from './dto/register-input.dto';
import type { RegisterDto } from './dto/register.dto';
import { RegisterAccessService } from './register-access.service';
import {
  RegisterSubmitAction,
  REGISTER_SUBMIT_ACTION,
  type RegisterSubmitPayload,
} from './register-submit.action';
import { RegisterViewService } from './register-view.service';
import { RegisterWriter } from './register-writer';
import type { RegisterAction } from './register-state';

/** Student attendance registers: draft (H)(X)(O), submit (P)(X)(O). */
@Injectable()
export class RegistersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: RegisterAccessService,
    private readonly view: RegisterViewService,
    private readonly writer: RegisterWriter,
    private readonly submitAction: RegisterSubmitAction,
    private readonly gate: ProbationGate,
    private readonly requests: ClientRequestService,
    private readonly workingDays: WorkingDayService,
    private readonly audit: AuditService,
  ) {}

  async get(scope: Scope, sectionId: string, date: string) {
    const section = await this.access.readable(scope, sectionId);
    return this.view.build(section, parseDate(date));
  }

  async save(
    user: AuthUser,
    scope: Scope,
    dto: SaveRegisterDto,
  ): Promise<RegisterDto> {
    const key = this.key(user, dto.clientRequestId, 'attendance.save');
    const actor = await this.access.writer(user, scope, dto.sectionId);
    const date = await this.checkDate(actor.section, dto.date);
    if ((await this.requests.seen(key)) !== undefined)
      return this.view.build(actor.section, date);
    const result = await this.write(actor, date, dto.entries, 'SAVE_DRAFT', {
      user,
      key,
    });
    this.stage(actor.section, result.registerId, 'attendance.save_draft', {
      entries: dto.entries.length,
      onBehalfOfStaffId: actor.onBehalfOfStaffId,
    });
    return this.view.build(actor.section, date);
  }

  async submit(
    user: AuthUser,
    scope: Scope,
    dto: SubmitRegisterDto,
  ): Promise<RegisterDto> {
    const key = this.key(user, dto.clientRequestId, 'attendance.submit');
    const actor = await this.access.writer(user, scope, dto.sectionId);
    if (actor.helper) throw forbidden('Helpers cannot submit attendance');
    const date = await this.checkDate(actor.section, dto.date);
    if ((await this.requests.seen(key)) !== undefined)
      return this.view.build(actor.section, date);
    const { registerId } = await this.write(
      actor,
      date,
      dto.entries ?? [],
      'SUBMIT',
      { user, key },
    );
    const payload: RegisterSubmitPayload = {
      registerId,
      userId: user.id,
      onBehalfOfStaffId: actor.onBehalfOfStaffId,
    };
    const result = await this.gate.run(
      { userId: user.id, onBehalfOfStaffId: actor.onBehalfOfStaffId },
      {
        key: REGISTER_SUBMIT_ACTION,
        entityType: 'AttendanceRegister',
        entityId: registerId,
        schoolId: actor.section.schoolId,
        branchId: actor.section.branchId,
        title: `Attendance ${dto.date}`,
        payload,
      },
      () =>
        this.prisma.$transaction((tx) =>
          this.submitAction.apply(
            payload,
            {
              performedById: user.id,
              onBehalfOfStaffId: actor.onBehalfOfStaffId,
            },
            tx,
          ),
        ),
    );
    this.stage(actor.section, registerId, 'attendance.submit_request', {
      result: result.status,
      approvalId: result.approvalId,
    });
    return this.view.build(actor.section, date);
  }

  private async write(
    actor: {
      section: Section;
      onBehalfOfStaffId: string | null;
      helper: boolean;
    },
    date: Date,
    entries: EntryInputDto[],
    action: RegisterAction,
    ctx: { user: AuthUser; key: ReturnType<RegistersService['key']> },
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const saved = await this.writer.save(tx, {
          section: actor.section,
          date,
          entries,
          userId: ctx.user.id,
          action,
          onBehalfOfStaffId: actor.onBehalfOfStaffId,
          helper: actor.helper,
        });
        await this.requests.remember(tx, ctx.key, saved.registerId);
        return saved;
      });
    } catch (error) {
      if (
        error instanceof AppError &&
        error.code === ErrorCode.ALREADY_SUBMITTED
      ) {
        throw new AppError(
          ErrorCode.ALREADY_SUBMITTED,
          error.message,
          await this.view.build(actor.section, date),
        );
      }
      throw error;
    }
  }

  private async checkDate(section: Section, value: string): Promise<Date> {
    const date = parseDate(value);
    if (date > today()) throw invalid('Attendance cannot be marked ahead');
    await this.workingDays.assertWorkingDay(section.branchId, date);
    return date;
  }

  private key(
    user: AuthUser,
    clientRequestId: string | undefined,
    action: string,
  ) {
    return { userId: user.id, clientRequestId, action };
  }

  private stage(section: Section, id: string, action: string, after: object) {
    this.audit.stage({
      action,
      entityType: 'AttendanceRegister',
      entityId: id,
      schoolId: section.schoolId,
      branchId: section.branchId,
      after,
    });
  }
}
