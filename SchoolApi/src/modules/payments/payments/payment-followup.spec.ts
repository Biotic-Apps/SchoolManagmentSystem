import type { Payment } from '../../../generated/prisma/client';
import type { NotificationService } from '../../../core/notifications/notification.service';
import type { LedgerService } from '../../finance-core/ledger.service';
import type { GeneratedDocumentService } from '../../generated-docs/generated-document.service';
import type { SchoolPeopleService } from '../../school-day/school-people.service';
import { PaymentFollowup } from './payment-followup';

describe('PaymentFollowup', () => {
  const payment = {
    id: 'p1',
    schoolId: 's1',
    studentId: 'st1',
    receivedById: 'u1',
    receiptNo: 'RCT-1',
    amountMinor: 500_000n,
    currency: 'PKR',
  } as Payment;

  function setup(balance: bigint) {
    const documents = { request: jest.fn().mockResolvedValue({}) };
    const people = { guardianUserIds: jest.fn().mockResolvedValue(['g1']) };
    const notifications = { notify: jest.fn().mockResolvedValue(undefined) };
    const ledger = { balance: jest.fn().mockResolvedValue(balance) };
    const followup = new PaymentFollowup(
      documents as unknown as GeneratedDocumentService,
      people as unknown as SchoolPeopleService,
      notifications as unknown as NotificationService,
      ledger as unknown as LedgerService,
    );
    return { followup, documents, notifications };
  }

  it('renders the receipt and alerts guardians with the remaining balance', async () => {
    const { followup, documents, notifications } = setup(250_000n);
    await followup.afterRecord({ id: 'u1' }, payment, 'Ali Khan');
    expect(documents.request).toHaveBeenCalledWith(
      { id: 'u1' },
      expect.objectContaining({ kind: 'RECEIPT', entityId: 'p1' }),
    );
    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userIds: ['g1'],
        category: 'FEE',
        channels: ['PUSH', 'SMS'],
      }),
    );
    const [input] = notifications.notify.mock.calls[0] as [{ body: string }];
    expect(input.body).toContain('Remaining balance PKR 2,500.00');
  });

  it('never throws when the alert fails', async () => {
    const { followup, notifications } = setup(0n);
    notifications.notify.mockRejectedValue(new Error('down'));
    await expect(
      followup.afterRecord({ id: 'u1' }, payment, 'Ali'),
    ).resolves.toBeUndefined();
  });
});
