import type { Attachment } from "@/features/files/types";

export interface ThreadParticipant {
  userId: string;
  name: string;
  role: string;
}

export interface Thread {
  id: string;
  subject: string;
  student: { id: string; name: string; className: string | null; sectionName: string | null };
  participants: ThreadParticipant[];
  lastMessage: { body: string; at: string; senderName: string } | null;
  unreadCount: number;
  closed: boolean;
}

export interface Message {
  id: string;
  threadId: string;
  sender: ThreadParticipant;
  body: string;
  attachments: Attachment[];
  sentAt: string;
  readByOthers: boolean;
}

export interface ThreadDetail {
  thread: Thread;
  messages: Message[];
}

export interface NewThreadInput {
  studentId: string;
  staffUserId?: string;
  subject: string;
  body: string;
  attachmentFileIds?: string[];
}

export interface SendMessageInput {
  body: string;
  attachmentFileIds?: string[];
}

/** Outside office hours the message is stored but no push is sent. */
export interface SendResult {
  deliveredSilently?: boolean;
  status?: string;
}
