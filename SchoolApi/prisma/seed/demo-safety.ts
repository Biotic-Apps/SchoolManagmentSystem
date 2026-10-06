import type { SeedClient } from './client';
import { type DailyContext, userId } from './demo-daily-context';

/** Allergy profile in 5-A, a minor incident, verified pickup persons, one early-leave request today. */
export async function seedSafety(prisma: SeedClient, ctx: DailyContext): Promise<void> {
  const fiveA = ctx.students.get('5-A')!;
  const allergic = fiveA[2];
  await prisma.studentHealthProfile.upsert({
    where: { studentId: allergic.id },
    create: { studentId: allergic.id },
    update: {},
  });
  await prisma.studentHealthProfile.update({
    where: { studentId: allergic.id },
    data: {
      bloodGroup: 'B+',
      allergies: 'Peanuts',
      allergyList: [{ name: 'Peanuts', severity: 'SEVERE', reaction: 'Swelling, breathing difficulty' }],
      instructions: 'Carries an inhaler; no peanut snacks.',
      notes: 'Carries an inhaler; no peanut snacks.',
      emergencyContacts: [{ name: 'Mr. Guardian', relation: 'FATHER', phone: '+923001234567', priority: 1 }],
    },
  });

  const principal = userId(ctx, 'principal@eschool.local');
  const teacher = userId(ctx, 'teacher@eschool.local');
  const minor = fiveA[4];
  if (!(await prisma.healthIncident.findFirst({ where: { studentId: minor.id } }))) {
    await prisma.healthIncident.create({
      data: {
        schoolId: ctx.org.schoolId,
        branchId: ctx.org.branchId,
        studentId: minor.id,
        occurredAt: new Date(ctx.today.getTime() + 5 * 3600_000),
        type: 'INJURY',
        severity: 'MINOR',
        description: 'Scraped knee during the break.',
        actionTaken: 'Cleaned and bandaged at the first-aid room.',
        status: 'PARENT_NOTIFIED',
        reportedById: teacher,
      },
    });
  }

  const parentUser = userId(ctx, 'parent@eschool.local');
  const children = [fiveA[0], ctx.students.get('4-B')![0]];
  for (const child of children) {
    if (await prisma.pickupPerson.findFirst({ where: { studentId: child.id } })) continue;
    await prisma.pickupPerson.create({
      data: {
        schoolId: ctx.org.schoolId,
        studentId: child.id,
        name: 'Bilal Javed',
        relation: 'UNCLE',
        cnic: '35202-1234567-1',
        phone: '+923005556677',
        status: 'VERIFIED',
        addedById: parentUser,
        verifiedById: principal,
        verifiedAt: new Date(),
      },
    });
  }

  const omar = children[1];
  if (await prisma.earlyLeave.findFirst({ where: { studentId: omar.id, date: ctx.today } })) return;
  const person = await prisma.pickupPerson.findFirstOrThrow({ where: { studentId: omar.id } });
  const leave = await prisma.earlyLeave.create({
    data: {
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      sectionId: ctx.org.sections.get('4-B')!,
      studentId: omar.id,
      date: ctx.today,
      time: '11:30',
      reason: 'Dentist appointment',
      pickupPersonId: person.id,
      requestedById: parentUser,
    },
  });
  const approval = await prisma.approvalRequest.create({
    data: {
      type: 'EARLY_LEAVE',
      entityType: 'EarlyLeave',
      entityId: leave.id,
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      requestedById: parentUser,
      title: `Early leave: ${omar.name} at 11:30`,
      payload: { earlyLeaveId: leave.id },
      steps: { create: [{ order: 1, approverRole: 'PRINCIPAL' }] },
    },
  });
  await prisma.earlyLeave.update({ where: { id: leave.id }, data: { approvalId: approval.id } });
}
