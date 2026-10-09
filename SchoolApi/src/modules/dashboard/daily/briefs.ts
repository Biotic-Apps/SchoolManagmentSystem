import { formatDate } from '../../../core/common/dates';
import type {
  MeetingBriefDto,
  NoticeBriefDto,
} from '../dto/daily-dashboard.dto';

interface NoticeRow {
  readAt: Date | null;
  notice: {
    id: string;
    title: string;
    body: string;
    pinned: boolean;
    publishedAt: Date | null;
  };
}

interface MeetingRow {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  mode: string;
  location: string | null;
  agenda: string;
  status: string;
  staffUser: { id: string; name: string };
}

export const toNoticeBrief = (r: NoticeRow): NoticeBriefDto => ({
  id: r.notice.id,
  title: r.notice.title,
  body: r.notice.body,
  pinned: r.notice.pinned,
  publishedAt: r.notice.publishedAt?.toISOString() ?? null,
  read: r.readAt !== null,
});

export const toMeetingBrief = (m: MeetingRow): MeetingBriefDto => ({
  id: m.id,
  date: formatDate(m.date),
  startTime: m.startTime,
  endTime: m.endTime,
  mode: m.mode,
  location: m.location,
  agenda: m.agenda,
  status: m.status,
  staff: { userId: m.staffUser.id, name: m.staffUser.name },
});

/** Published notices addressed to the user, pinned first. */
export const noticeQuery = (userId: string, day: Date, take = 5) => ({
  where: {
    userId,
    notice: {
      status: 'PUBLISHED' as const,
      OR: [{ expiresOn: null }, { expiresOn: { gte: day } }],
    },
  },
  include: { notice: true },
  orderBy: [
    { notice: { pinned: 'desc' as const } },
    { notice: { publishedAt: 'desc' as const } },
  ],
  take,
});
