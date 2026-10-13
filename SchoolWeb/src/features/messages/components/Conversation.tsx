"use client";

import { ArrowLeft, MessageSquare } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { classLabel } from "../format";
import { useConversation } from "../use-conversation";
import { useScrollToLatest } from "../use-scroll-to-latest";
import { Composer } from "./Composer";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "../types";

function isToday(date: string | Date): boolean {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-border" />
      <span className="select-none text-caption text-fg-muted">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

/** Insert a "Today" divider before the first message that falls on today's date. */
function shouldShowTodayDivider(messages: Message[], index: number): boolean {
  const msg = messages[index];
  if (!isToday(msg.sentAt)) return false;
  if (index === 0) return true;
  return !isToday(messages[index - 1].sentAt);
}

interface ConversationProps {
  threadId: string;
  readOnly: boolean;
  onBack: () => void;
}

export function Conversation({ threadId, readOnly, onBack }: ConversationProps) {
  const chat = useConversation(threadId, readOnly);
  const { thread, messages, query } = chat;
  const scrollRef = useScrollToLatest(messages.at(-1)?.id);
  const section = thread ? classLabel(thread.student.className, thread.student.sectionName) : "";

  return (
    <>
      {/* ---- Header ---- */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-4">
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Back to conversations" onClick={onBack}>
          <ArrowLeft />
        </Button>
        {thread ? (
          <>
            <PersonAvatar name={thread.student.name} size="md" />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-body font-semibold text-fg">{thread.subject}</h2>
                {thread.closed && <Badge>Closed</Badge>}
              </div>
              <p className="truncate text-caption text-fg-muted">
                {section ? `${thread.student.name} · ${section}` : thread.student.name}
                {thread.participants.length > 0 && ` — ${thread.participants.map((p) => p.name).join(", ")}`}
              </p>
            </div>
          </>
        ) : (
          <>
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <Skeleton className="h-10 flex-1" />
          </>
        )}
      </div>

      {/* ---- Message list ---- */}
      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-background px-4 py-4">
        {chat.canLoadEarlier && (
          <button
            type="button"
            className="self-center text-caption font-medium text-primary hover:underline disabled:opacity-50"
            disabled={chat.loadingEarlier}
            onClick={() => chat.loadEarlier()}
          >
            {chat.loadingEarlier ? "Loading..." : "Load earlier messages"}
          </button>
        )}

        {query.isLoading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-14 w-3/5 rounded-2xl rounded-bl-md" />
            <Skeleton className="h-10 w-2/5 self-end rounded-2xl rounded-br-md" />
            <Skeleton className="h-14 w-1/2 rounded-2xl rounded-bl-md" />
          </div>
        )}

        {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}

        {!query.isLoading && !query.error && messages.length === 0 && (
          <div className="m-auto flex flex-col items-center gap-3 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-surface">
              <MessageSquare className="size-7 text-fg-muted" />
            </div>
            <p className="text-label font-medium text-fg-muted">No messages yet</p>
            <p className="max-w-xs text-caption text-fg-muted">
              Start the conversation by sending the first message below.
            </p>
          </div>
        )}

        {messages.map((message, i) => (
          <div key={message.id}>
            {shouldShowTodayDivider(messages, i) && <DateDivider label="Today" />}
            <MessageBubble message={message} mine={chat.isMine(message)} />
          </div>
        ))}
      </div>

      {/* ---- Footer ---- */}
      {readOnly ? (
        <InlineNotice className="m-4">Read-only — viewing is audited.</InlineNotice>
      ) : thread?.closed ? (
        <InlineNotice className="m-4">This conversation is closed.</InlineNotice>
      ) : (
        thread && <Composer threadId={threadId} />
      )}
    </>
  );
}
