import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { OnlinePaymentsService } from './online-payments.service';

const invoice = {
  id: 'inv1',
  studentId: 'st1',
  schoolId: 's1',
  branchId: 'b1',
  status: 'ISSUED',
  totalMinor: 500000n,
  paidMinor: 0n,
  currency: 'PKR',
};

function setup(configured: string, row: typeof invoice = invoice) {
  const initiate = jest
    .fn()
    .mockResolvedValue({ redirectUrl: 'https://pay.example/x' });
  const prisma = {
    invoice: { findUnique: jest.fn().mockResolvedValue(row) },
    onlinePayment: { create: jest.fn().mockResolvedValue({ id: 'op1' }) },
  };
  const registry = { get: jest.fn().mockReturnValue({ initiate }) };
  const settings = { get: jest.fn().mockResolvedValue(configured) };
  const service = new OnlinePaymentsService(
    prisma as never,
    registry as never,
    settings as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );
  const scope = {
    guardian: true,
    canAccessStudent: () => true,
  } as unknown as Scope;
  return { service, scope, initiate, prisma };
}

describe('OnlinePaymentsService.initiate gateway choice', () => {
  it('uses the wallet the parent chose when the school runs it', async () => {
    const { service, scope, initiate } = setup('EASYPAISA');
    const result = await service.initiate(scope, 'inv1', 'EASYPAISA');
    expect(result.gateway).toBe('EASYPAISA');
    expect(initiate).toHaveBeenCalled();
  });

  it('never swaps the chosen wallet for another one', async () => {
    const { service, scope, initiate } = setup('JAZZCASH');
    await expect(
      service.initiate(scope, 'inv1', 'EASYPAISA'),
    ).rejects.toMatchObject({
      code: ErrorCode.GATEWAY_DISABLED,
      message: 'Easypaisa is not available for this school; use JazzCash',
    });
    expect(initiate).not.toHaveBeenCalled();
  });

  it('refuses when online payment is off', async () => {
    const { service, scope } = setup('NONE');
    await expect(
      service.initiate(scope, 'inv1', 'JAZZCASH'),
    ).rejects.toMatchObject({ code: ErrorCode.GATEWAY_DISABLED });
  });
});

describe('OnlinePaymentsService.initiate amount', () => {
  it('charges only the open balance of a part-paid invoice', async () => {
    const { service, scope, initiate, prisma } = setup('JAZZCASH', {
      ...invoice,
      status: 'PARTIALLY_PAID',
      paidMinor: 200000n,
    });
    await service.initiate(scope, 'inv1', 'JAZZCASH');
    expect(initiate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'inv1' }),
      300000n,
    );
    expect(prisma.onlinePayment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ amountMinor: 300000n }) as unknown,
    });
  });

  it('refuses when nothing is due', async () => {
    const { service, scope, initiate } = setup('JAZZCASH', {
      ...invoice,
      paidMinor: 500000n,
    });
    await expect(
      service.initiate(scope, 'inv1', 'JAZZCASH'),
    ).rejects.toMatchObject({ status: 409 });
    expect(initiate).not.toHaveBeenCalled();
  });
});
