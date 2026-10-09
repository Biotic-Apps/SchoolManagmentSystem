import type { Prisma } from '../../generated/prisma/client';
import type { NotificationService } from '../../core/notifications/notification.service';
import type { NoticeOverseers } from './notice-overseers.service';
import { NoticePublisher } from './notice-publisher.service';
import type { NoticeRecipientsService } from './notice-recipients.service';

describe('NoticePublisher', () => {
  it('notifies recipients, then principals who are not already told', async () => {
    const notice = {
      id: 'n1',
      schoolId: 's',
      branchId: 'b',
      authorId: 'coordinator',
      title: 'School closed',
      body: 'Friday',
    };
    const tx = {
      notice: {
        findUniqueOrThrow: jest.fn().mockResolvedValue(notice),
        update: jest.fn(),
      },
      noticeRecipient: { createMany: jest.fn() },
    } as unknown as Prisma.TransactionClient;
    const notify = jest.fn();
    const notifyPosted = jest.fn();
    const publisher = new NoticePublisher(
      {
        resolve: jest.fn().mockResolvedValue(['parent1', 'parent2']),
      } as unknown as NoticeRecipientsService,
      { notify } as unknown as NotificationService,
      { notifyPosted } as unknown as NoticeOverseers,
    );

    await expect(publisher.publish('n1', 'coordinator', tx)).resolves.toBe(2);
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ userIds: ['parent1', 'parent2'] }),
    );
    expect(notifyPosted).toHaveBeenCalledWith(
      notice,
      ['parent1', 'parent2', 'coordinator'],
      tx,
    );
  });
});
