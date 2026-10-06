import type { SeedClient } from './client';
import { addDays, type DailyContext, userId } from './demo-daily-context';
import { day, iso } from './demo-finance-helpers';
import { bumpSequence } from './demo-people';

const CATEGORIES = [
  ['RENT', 'Rent'],
  ['UTILITIES', 'Utilities'],
  ['SUPPLIES', 'Supplies'],
  ['REPAIRS', 'Repairs'],
  ['MAINTENANCE', 'Maintenance'],
  ['TRANSPORT', 'Transport'],
  ['SALARY_OTHER', 'Other salaries'],
  ['OTHER', 'Other'],
] as const;

const VENDORS = [
  {
    name: 'City Properties',
    contactPerson: 'Kamran Ali',
    phone: '+924235550101',
  },
  { name: 'LESCO', contactPerson: 'Billing desk', phone: '+924299990000' },
  {
    name: 'Al-Noor Stationers',
    contactPerson: 'Naveed Ahmad',
    phone: '+923214445566',
    ntn: '1234567-8',
  },
];

const ITEMS = [
  {
    sku: 'CHAIR-01',
    name: 'Student chair',
    category: 'FURNITURE',
    unit: 'piece',
    reorderLevel: 5,
    isAsset: true,
    saleable: false,
    stock: 40,
  },
  {
    sku: 'NB-01',
    name: 'Notebook (100 pages)',
    category: 'STATIONERY',
    unit: 'piece',
    reorderLevel: 50,
    isAsset: false,
    saleable: true,
    salePriceMinor: 15_000,
    stock: 380,
  },
  {
    sku: 'UNI-SHIRT',
    name: 'Uniform shirt',
    category: 'UNIFORM',
    unit: 'piece',
    reorderLevel: 10,
    isAsset: false,
    saleable: true,
    salePriceMinor: 150_000,
    stock: 60,
  },
  {
    sku: 'MRK-01',
    name: 'Whiteboard marker',
    category: 'STATIONERY',
    unit: 'box',
    reorderLevel: 10,
    isAsset: false,
    saleable: false,
    stock: 3,
  },
] as const;

async function seedMasters(prisma: SeedClient, ctx: DailyContext) {
  const categories = new Map<string, string>();
  for (const [code, name] of CATEGORIES) {
    const row = await prisma.expenseCategory.upsert({
      where: { schoolId_code: { schoolId: ctx.org.schoolId, code } },
      create: { schoolId: ctx.org.schoolId, code, name },
      update: {},
    });
    categories.set(code, row.id);
  }
  const vendors = new Map<string, string>();
  const accountant = userId(ctx, 'accountant@eschool.local');
  for (const vendor of VENDORS) {
    const row = await prisma.vendor.upsert({
      where: {
        schoolId_name: { schoolId: ctx.org.schoolId, name: vendor.name },
      },
      create: {
        schoolId: ctx.org.schoolId,
        createdById: accountant,
        ...vendor,
      },
      update: {},
    });
    vendors.set(vendor.name, row.id);
  }
  return { categories, vendors };
}

async function seedExpenses(
  prisma: SeedClient,
  ctx: DailyContext,
  m: Awaited<ReturnType<typeof seedMasters>>,
) {
  if (await prisma.expense.findFirst({ where: { branchId: ctx.org.branchId } }))
    return;
  const accountant = userId(ctx, 'accountant@eschool.local');
  const month = iso(ctx.today).slice(0, 7);
  const base = {
    schoolId: ctx.org.schoolId,
    branchId: ctx.org.branchId,
    createdById: accountant,
  };
  const firstOfMonth = day(`${month}-01`);
  const rent = await prisma.expense.create({
    data: {
      ...base,
      categoryId: m.categories.get('RENT')!,
      vendorId: m.vendors.get('City Properties')!,
      title: 'Building rent',
      amountMinor: 25_000_000n,
      paidMinor: 25_000_000n,
      billDate: firstOfMonth,
      dueDate: addDays(firstOfMonth, 5),
      recurringMonthly: true,
      status: 'PAID',
      notes: 'Monthly rent, recurring',
    },
  });
  await prisma.expensePayment.create({
    data: {
      expenseId: rent.id,
      amountMinor: 25_000_000n,
      method: 'BANK',
      reference: 'CHQ-100231',
      paidOn: firstOfMonth,
      paidById: accountant,
    },
  });
  const billDate = addDays(ctx.today, -12);
  const power = await prisma.expense.create({
    data: {
      ...base,
      categoryId: m.categories.get('UTILITIES')!,
      vendorId: m.vendors.get('LESCO')!,
      title: 'Electricity bill',
      amountMinor: 4_850_000n,
      paidMinor: 4_850_000n,
      billDate,
      dueDate: addDays(billDate, 10),
      status: 'PAID',
    },
  });
  await prisma.expensePayment.create({
    data: {
      expenseId: power.id,
      amountMinor: 4_850_000n,
      method: 'BANK',
      reference: 'LESCO-ONLINE-7781',
      paidOn: addDays(billDate, 3),
      paidById: accountant,
    },
  });
  const repairs = await prisma.expense.create({
    data: {
      ...base,
      categoryId: m.categories.get('REPAIRS')!,
      title: 'Classroom fan repairs',
      amountMinor: 1_500_000n,
      billDate: addDays(ctx.today, -2),
      status: 'SUBMITTED',
    },
  });
  const approval = await prisma.approvalRequest.create({
    data: {
      type: 'EXPENSE',
      entityType: 'Expense',
      entityId: repairs.id,
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      requestedById: accountant,
      title: 'Expense: Classroom fan repairs',
      amountMinor: 1_500_000n,
      payload: { expenseId: repairs.id },
      steps: {
        create: [
          {
            order: 1,
            approverRole: 'PRINCIPAL',
            amountLimitMinor: 10_000_000n,
          },
          { order: 2, approverRole: 'SUPER_ADMIN' },
        ],
      },
    },
  });
  await prisma.expense.update({
    where: { id: repairs.id },
    data: { approvalId: approval.id },
  });
}

async function seedInventory(
  prisma: SeedClient,
  ctx: DailyContext,
  vendors: Map<string, string>,
) {
  if (
    await prisma.inventoryItem.findFirst({
      where: { schoolId: ctx.org.schoolId },
    })
  )
    return;
  const accountant = userId(ctx, 'accountant@eschool.local');
  const principal = userId(ctx, 'principal@eschool.local');
  const where = { schoolId: ctx.org.schoolId, branchId: ctx.org.branchId };
  const items = new Map<string, string>();
  for (const { stock, ...seed } of ITEMS) {
    const item = await prisma.inventoryItem.create({
      data: {
        schoolId: ctx.org.schoolId,
        ...seed,
        salePriceMinor:
          'salePriceMinor' in seed ? BigInt(seed.salePriceMinor) : null,
      },
    });
    items.set(seed.sku, item.id);
    await prisma.stockMovement.create({
      data: {
        ...where,
        itemId: item.id,
        type: 'IN',
        quantity: stock,
        reason: 'Opening stock',
        createdById: accountant,
      },
    });
  }
  await prisma.stockMovement.create({
    data: {
      ...where,
      itemId: items.get('NB-01')!,
      type: 'ISSUE',
      quantity: -120,
      issuedTo: 'Class 5 teachers',
      reason: 'Term supplies',
      createdById: accountant,
    },
  });
  for (const [n, location] of [
    'Room 5-A',
    'Room 5-A',
    'Staff room',
  ].entries()) {
    await prisma.asset.create({
      data: {
        ...where,
        itemId: items.get('CHAIR-01')!,
        tag: `CH-${String(n + 1).padStart(3, '0')}`,
        location,
        condition: n === 2 ? 'FAIR' : 'GOOD',
        createdById: accountant,
      },
    });
  }
  // Purchase request → approved → PO partially received.
  const year = ctx.today.getUTCFullYear();
  const request = await prisma.purchaseRequest.create({
    data: {
      ...where,
      requestNo: `PR-MAIN-${year}-0001`,
      reason: 'Notebooks for the second term',
      lines: [
        {
          itemId: items.get('NB-01')!,
          quantity: 200,
          estimatedUnitMinor: 6_000,
        },
      ],
      estimatedTotalMinor: 1_200_000n,
      status: 'ORDERED',
      requestedById: accountant,
      decidedAt: addDays(ctx.today, -9),
    },
  });
  const approval = await prisma.approvalRequest.create({
    data: {
      type: 'PURCHASE_ORDER',
      entityType: 'PurchaseRequest',
      entityId: request.id,
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      requestedById: accountant,
      title: `Purchase request PR-MAIN-${year}-0001`,
      amountMinor: 1_200_000n,
      payload: { purchaseRequestId: request.id },
      status: 'APPROVED',
      decidedAt: addDays(ctx.today, -9),
      steps: {
        create: [
          {
            order: 1,
            approverRole: 'PRINCIPAL',
            amountLimitMinor: 10_000_000n,
            decision: 'APPROVED',
            decidedById: principal,
            decidedAt: addDays(ctx.today, -9),
          },
          { order: 2, approverRole: 'SUPER_ADMIN' },
        ],
      },
    },
  });
  await prisma.purchaseRequest.update({
    where: { id: request.id },
    data: { approvalId: approval.id },
  });
  const order = await prisma.purchaseOrder.create({
    data: {
      ...where,
      poNo: `PO-MAIN-${year}-0001`,
      requestId: request.id,
      vendorId: vendors.get('Al-Noor Stationers')!,
      status: 'PARTIALLY_RECEIVED',
      totalMinor: 1_160_000n,
      expectedOn: addDays(ctx.today, 5),
      createdById: accountant,
      lines: {
        create: [
          {
            itemId: items.get('NB-01')!,
            quantity: 200,
            unitPriceMinor: 5_800n,
            receivedQty: 120,
          },
        ],
      },
    },
  });
  await prisma.goodsReceipt.create({
    data: {
      orderId: order.id,
      receivedOn: addDays(ctx.today, -3),
      lines: [{ itemId: items.get('NB-01')!, quantity: 120 }],
      receivedById: accountant,
    },
  });
  await prisma.stockMovement.create({
    data: {
      ...where,
      itemId: items.get('NB-01')!,
      type: 'IN',
      quantity: 120,
      reason: `PO-MAIN-${year}-0001`,
      refType: 'PurchaseOrder',
      refId: order.id,
      createdById: accountant,
    },
  });
  await bumpSequence(prisma, `pr:${ctx.org.branchId}:${year}`, 2);
  await bumpSequence(prisma, `po:${ctx.org.branchId}:${year}`, 2);
}

/** Phase 4 §J expenses, vendors and inventory. */
export async function seedProcurement(
  prisma: SeedClient,
  ctx: DailyContext,
): Promise<void> {
  const masters = await seedMasters(prisma, ctx);
  await seedExpenses(prisma, ctx, masters);
  await seedInventory(prisma, ctx, masters.vendors);
}
