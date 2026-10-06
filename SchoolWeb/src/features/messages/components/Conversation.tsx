"use client";

import { ArrowLeft } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { classLabel } from "../format";
import { useConversation } from "../use-conversation";
import { useScrollToLatest } from "../use-scroll-to-latest";
import { Composer } from "./Composer";
import { MessageBubble } from "./MessageBubble";

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
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Back to conversations" onClick={onBack}>
          <ArrowLeft />
        </Button>
        {thread ? (
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
        ) : (
          <Skeleton className="h-10 flex-1" />
        )}
      </div>

      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-background px-4 py-4">
        {chat.canLoadEarlier && (
          <Button
            variant="secondary"
            size="sm"
            className="self-center"
            loading={chat.loadingEarlier}
            onClick={() => chat.loadEarlier()}
          >
            Load earlier
          </Button>
        )}
        {query.isLoading && (
          <>
            <Skeleton className="h-16 w-2/3" />
            <Skeleton className="h-16 w-2/3 self-end" />
          </>
        )}
        {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
        {!query.isLoading && !query.error && messages.length === 0 && (
          <p className="m-auto text-label text-fg-muted">No messages in this conversation yet.</p>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} mine={chat.isMine(message)} />
        ))}
      </div>

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
