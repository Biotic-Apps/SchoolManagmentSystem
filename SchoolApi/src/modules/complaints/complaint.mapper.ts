import type { Prisma } from '../../generated/prisma/client';
import { maskPerson, type MaskViewer } from './complaint-masking';
import { isOpen } from './complaint-status';
import type { AttachmentDto, ComplaintDto } from './dto/complaint.dto';

const PERSON = { select: { id: true, name: true } } as const;

export const COMPLAINT_INCLUDE = {
  complainant: PERSON,
  against: PERSON,
  assignee: PERSON,
  student: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.ComplaintInclude;

export const COMPLAINT_DETAIL_INCLUDE = {
  ...COMPLAINT_INCLUDE,
  updates: { orderBy: { createdAt: 'asc' }, include: { author: PERSON } },
} satisfies Prisma.ComplaintInclude;

type ComplaintBase = Prisma.ComplaintGetPayload<{
  include: typeof COMPLAINT_INCLUDE;
}>;
type UpdateRow = Prisma.ComplaintUpdateGetPayload<{
  include: { author: typeof PERSON };
}>;
export type ComplaintRow = ComplaintBase & { updates?: UpdateRow[] };

/** File ids referenced by the complaint and its updates. */
export function attachmentIds(row: ComplaintRow): string[] {
  return [
    ...row.attachmentFileIds,
    ...(row.updates ?? []).flatMap((u) => u.attachmentFileIds),
  ];
}

export function toComplaintDto(
  row: ComplaintRow,
  viewer: MaskViewer,
  files: Map<string, AttachmentDto>,
  now = new Date(),
): ComplaintDto {
  const attach = (ids: string[]) =>
    ids.flatMap((id) => (files.has(id) ? [files.get(id)!] : []));
  return {
    id: row.id,
    ticketNo: row.ticketNo,
    category: row.category,
    subject: row.subject,
    description: row.description,
    status: row.status,
    escalationLevel: row.escalationLevel,
    slaDueAt: row.slaDueAt.toISOString(),
    overdue: isOpen(row.status) && row.slaDueAt < now,
    complainant: maskPerson(
      {
        id: row.complainant.id,
        name: row.complainant.name,
        role: row.complainantRole,
      },
      row.complainantId,
      viewer,
      row,
    ),
    against: row.against,
    student: row.student
      ? {
          id: row.student.id,
          name: `${row.student.firstName} ${row.student.lastName}`,
        }
      : null,
    assignee: row.assignee,
    attachments: attach(row.attachmentFileIds),
    updates: (row.updates ?? []).map((u) => ({
      id: u.id,
      author: maskPerson(u.author, u.authorId, viewer, row),
      message: u.message,
      status: u.status,
      attachments: attach(u.attachmentFileIds),
      at: u.createdAt.toISOString(),
    })),
    createdAt: row.createdAt.toISOString(),
  };
}
